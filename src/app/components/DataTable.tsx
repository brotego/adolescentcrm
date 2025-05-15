'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { supabase } from '../lib/supabase'
import { 
  MagnifyingGlassIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChevronUpDownIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  PencilIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface FormSubmission {
  id: string
  form_name: string
  submission: Record<string, any>
  created_at: string
  notes?: string
}

interface ColumnConfig {
  isMultipleChoice?: boolean;
  isLink?: boolean;
  isEmptyRed?: boolean;
  coloredValues?: Record<string, string>;
}

interface FormTable {
  formName: string
  columns: string[]
  data: Record<string, any>[]
  section?: string
  columnConfig?: Record<string, ColumnConfig>
}

interface Filter {
  column: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between'
  value: string | [string, string]
}

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  currentNotes: string;
  onSave: (notes: string) => Promise<void>;
}

interface NameObject {
  Name: string;
}

interface ActiveFilter {
  value: string;
  column: string;
  type: string;
}

const getFieldType = (value: any, columnName: string, table: FormTable): string => {
  const columnConfig = table.columnConfig?.[columnName];
  
  if (columnConfig?.isMultipleChoice) {
    return 'multiple-choice';
  }
  
  if (columnConfig?.isLink) {
    return 'link';
  }

  if (columnConfig?.isEmptyRed && (!value || value === 'n/a' || value === 'no' || value.toString().toLowerCase().startsWith('n'))) {
    return 'empty';
  }

  // First check if it's a boolean
  if (typeof value === 'boolean') return 'boolean'
  
  // First check column name for hints
  const lowerColumnName = columnName.toLowerCase()
  
  // Handle new Typeform format
  if (columnName.includes('email') || columnName.includes('Email')) return 'person'
  if (columnName.includes('phone') || columnName.includes('Phone')) return 'contact'
  if (columnName.includes('date') || columnName.includes('Date')) return 'date'
  if (columnName.includes('address') || columnName.includes('Address')) return 'location'
  if (columnName.includes('city') || columnName.includes('City')) return 'location'
  if (columnName.includes('state') || columnName.includes('State')) return 'state'
  if (columnName.includes('postal') || columnName.includes('Postal')) return 'location'
  if (columnName.includes('name') || columnName.includes('Name')) return 'text'
  if (columnName.includes('website') || columnName.includes('Website')) {
    if (!value || value.toLowerCase().startsWith('n')) return 'empty'
    return 'link'
  }
  if (columnName.includes('instagram') || columnName.includes('Instagram')) return 'link'
  if (columnName.includes('social') || columnName.includes('Social')) return 'link'
  
  // Handle old format
  if (lowerColumnName.includes('email')) return 'person'
  if (lowerColumnName.includes('phone')) return 'contact'
  if (lowerColumnName.includes('date')) return 'date'
  if (lowerColumnName.includes('status')) return 'status'
  if (lowerColumnName.includes('location') || lowerColumnName.includes('country')) return 'location'
  if (lowerColumnName.includes('state')) return 'state'
  if (lowerColumnName.includes('amount') || lowerColumnName.includes('price') || lowerColumnName.includes('total')) return 'currency'
  if (lowerColumnName.includes('age') || lowerColumnName.includes('count') || lowerColumnName.includes('quantity')) return 'number'
  if (lowerColumnName.includes('name') || columnName.includes('title')) return 'text'
  
  // Then check value content
  if (typeof value === 'number') return 'number'
  if (value instanceof Date || !isNaN(Date.parse(value))) return 'date'
  if (typeof value === 'string') {
    if (value.includes('@')) return 'person'
    if (value.match(/^[A-Z]{2}$/)) return 'state'
    if (value.match(/^\$?\d+(\.\d{2})?$/)) return 'currency'
    if (value.match(/^\d{3}[-.]?\d{3}[-.]?\d{4}$/)) return 'contact'
    if (['pending', 'approved', 'rejected', 'completed', 'in progress', 'cancelled'].includes(value.toLowerCase())) return 'status'
    if (value.startsWith('http')) return 'link'
    if (['n/a', 'na', 'no', 'none', 'null', 'undefined', ''].includes(value.toLowerCase())) return 'empty'
    return 'text'
  }
  return 'text'
}

const getFieldColor = (type: string, value: string, columnName: string, table: FormTable): string => {
  // Check for specific value coloring first
  const coloredValues = table.columnConfig?.[columnName]?.coloredValues;
  if (coloredValues && value in coloredValues) {
    return coloredValues[value];
  }

  if (type === 'multiple-choice' || type === 'link') {
    return 'bg-blue-100 text-blue-800';
  }
  
  if (type === 'empty') {
    return 'bg-red-100 text-red-800';
  }

  switch (type) {
    case 'boolean':
      return value === 'true' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
    case 'location':
      return 'bg-blue-50 text-blue-700 border border-blue-100'
    case 'state':
      return 'bg-blue-50 text-blue-700 border border-blue-100'
    case 'status':
      switch (value.toLowerCase()) {
        case 'approved':
          return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
        case 'rejected':
          return 'bg-rose-50 text-rose-700 border border-rose-100'
        case 'pending':
          return 'bg-amber-50 text-amber-700 border border-amber-100'
        case 'completed':
          return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
        case 'in progress':
          return 'bg-blue-50 text-blue-700 border border-blue-100'
        case 'cancelled':
          return 'bg-rose-50 text-rose-700 border border-rose-100'
        default:
          return 'bg-gray-50 text-gray-700 border border-gray-100'
      }
    case 'person':
      return 'bg-purple-50 text-purple-700 border border-purple-100'
    case 'contact':
      return 'bg-indigo-50 text-indigo-700 border border-indigo-100'
    case 'date':
      return 'bg-orange-50 text-orange-700 border border-orange-100'
    case 'number':
      return 'bg-teal-50 text-teal-700 border border-teal-100'
    case 'currency':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    case 'link':
      return 'bg-blue-50 text-blue-700 border border-blue-100'
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-100'
  }
}

const formatValue = (value: any, type: string) => {
  if (type === 'date') {
    try {
      // Handle different date formats
      let date: Date;
      if (typeof value === 'string') {
        // Try parsing as ISO string first
        date = new Date(value);
        if (isNaN(date.getTime())) {
          // If that fails, try parsing as a timestamp
          const timestamp = parseInt(value);
          if (!isNaN(timestamp)) {
            date = new Date(timestamp);
          }
        }
      } else if (typeof value === 'number') {
        // Handle numeric timestamps
        date = new Date(value);
      } else {
        date = new Date(value);
      }

      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).format(date);
      }
    } catch (e) {
      console.error('Error formatting date:', e);
    }
  }
  return value?.toString() || '-';
};

const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div
        onDoubleClick={() => setShow(true)}
        onMouseLeave={() => !show && setShow(false)}
        className="cursor-pointer"
      >
        {children}
      </div>
      {show && (
        <div 
          className="absolute z-10 w-64 p-2 mt-1 text-sm bg-[#000000] text-[#f0e7df] rounded-lg shadow-lg border border-[#f0e7df]"
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          <div className="relative">
            <button
              onClick={handleCopy}
              className="absolute top-0 right-0 p-1 hover:bg-[#1a1a1a] rounded"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg className="w-4 h-4 text-[#defe54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
            <div className="pr-8 break-words whitespace-pre-wrap">
              {content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NotesModal = ({ isOpen, onClose, submissionId, currentNotes, onSave }: NotesModalProps) => {
  const [notes, setNotes] = useState(currentNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [workQuality, setWorkQuality] = useState<string>('');
  const [timeliness, setTimeliness] = useState<string>('');
  const [projectType, setProjectType] = useState<string>('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Combine all fields into a structured notes format
      const structuredNotes = {
        workQuality,
        timeliness,
        projectType,
        additionalNotes: notes
      };
      await onSave(JSON.stringify(structuredNotes));
      onClose();
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#000000] p-6 rounded-lg border border-[#f0e7df] w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-[#f0e7df]">Add Notes</h3>
          <button
            onClick={onClose}
            className="text-[#f0e7df] hover:text-[#defe54]"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Structured Fields */}
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#f0e7df] mb-1">Work Quality</label>
            <select
              value={workQuality}
              onChange={(e) => setWorkQuality(e.target.value)}
              className="w-full p-2 bg-[#1a1a1a] text-[#f0e7df] border border-[#f0e7df] rounded-md focus:outline-none focus:ring-2 focus:ring-[#defe54]"
            >
              <option value="">Select quality</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="average">Average</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#f0e7df] mb-1">Timeliness</label>
            <select
              value={timeliness}
              onChange={(e) => setTimeliness(e.target.value)}
              className="w-full p-2 bg-[#1a1a1a] text-[#f0e7df] border border-[#f0e7df] rounded-md focus:outline-none focus:ring-2 focus:ring-[#defe54]"
            >
              <option value="">Select timeliness</option>
              <option value="early">Early</option>
              <option value="on-time">On Time</option>
              <option value="late">Late</option>
              <option value="very-late">Very Late</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#f0e7df] mb-1">Project Type</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full p-2 bg-[#1a1a1a] text-[#f0e7df] border border-[#f0e7df] rounded-md focus:outline-none focus:ring-2 focus:ring-[#defe54]"
            >
              <option value="">Select project type</option>
              <option value="photography">Photography</option>
              <option value="film">Film</option>
              <option value="video">Video</option>
              <option value="motion">Motion</option>
              <option value="design">Design</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-[#f0e7df] mb-1">Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 p-2 bg-[#1a1a1a] text-[#f0e7df] border border-[#f0e7df] rounded-md focus:outline-none focus:ring-2 focus:ring-[#defe54]"
            placeholder="Add any additional notes about this submission..."
          />
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-[#1a1a1a] text-[#f0e7df] rounded-md hover:bg-[#2a2a2a] border border-[#f0e7df]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-[#defe54] text-black rounded-md hover:bg-[#f0e7df] disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Ollama mapping function
async function mapRowWithOllama(row: Record<string, any>, columns: string[]): Promise<Record<string, any>> {
  const response = await fetch('/api/ollama-map', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row, columns })
  });
  if (!response.ok) throw new Error('Ollama mapping failed');
  return await response.json();
}

export default function DataTable() {
  const [formTables, setFormTables] = useState<FormTable[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('')
  const [pageIndex, setPageIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filter[]>([])
  const pageSize = 100
  const [sortField, setSortField] = useState<string>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<{ 
    id: string; 
    notes: string;
    submission: Record<string, any>;
  } | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<{ [tableName: string]: Set<string> }>({});
  const [moveTargetTable, setMoveTargetTable] = useState<string>('');
  const [undoStack, setUndoStack] = useState<FormTable[][]>([]);
  const [showRevert, setShowRevert] = useState(false);

  // Group tables by section
  const groupedTables = useMemo(() => {
    const groups: Record<string, FormTable[]> = {
      'Selected Creators': [],
      'ALL SUBMISSIONS': []
    };

    formTables.forEach(table => {
      // Check if this table was created from creator_log data
      if (table.section === 'Selected Creators') {
        groups['Selected Creators'].push(table);
      } else {
        groups['ALL SUBMISSIONS'].push(table);
      }
    });

    return groups;
  }, [formTables]);

  // Reset page index when search query changes
  useEffect(() => {
    setPageIndex(0)
  }, [searchQuery])

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting data fetch...')
        
        // First check if we can connect to Supabase at all
        const { data: testData, error: testError } = await supabase
          .from('form_submissions')
          .select('form_name')
          .limit(1)

        console.log('Connection test:', {
          success: !testError,
          error: testError?.message,
          data: testData,
          hasData: Array.isArray(testData) && testData.length > 0
        })
        
        if (testError) {
          throw new Error(`Supabase connection error: ${testError.message}`)
        }

        // Get creator_log data
        const { data: creatorLogData, error: creatorLogError } = await supabase
          .from('creator_log')
          .select('*')

        console.log('Creator Log direct query:', {
          success: !creatorLogError,
          error: creatorLogError?.message,
          totalRows: creatorLogData?.length,
          sampleRow: creatorLogData?.[0],
          tableName: 'creator_log'
        })
        
        // Get form_submissions data
        const { count: totalCount } = await supabase
          .from('form_submissions')
          .select('*', { count: 'exact', head: true })

        // Fetch form_submissions data in chunks
        const chunkSize = 1000
        const chunks = []
        for (let i = 0; i < totalCount!; i += chunkSize) {
          console.log(`Fetching chunk ${i} to ${i + chunkSize}`)
          const { data: chunk, error: chunkError } = await supabase
            .from('form_submissions')
            .select('*')
            .range(i, i + chunkSize - 1)
          
          if (chunkError) {
            console.error(`Error fetching chunk ${i}:`, chunkError)
            continue
          }
          chunks.push(chunk)
        }

        const formSubmissionsData = chunks.flat()

        // Process both sets of data
        const tables: Record<string, FormTable> = {}
        
        // Process creator_log data first
        if (creatorLogData && creatorLogData.length > 0) {
          // Group creator log entries by form_name
          const creatorLogsByForm = creatorLogData.reduce((acc: Record<string, any[]>, row) => {
            const formName = row.form_name || 'Unknown Form'
            if (!acc[formName]) {
              acc[formName] = []
            }
            
            // Parse submission data if it's a string
            let submissionData = row.submission
            if (typeof submissionData === 'string') {
              try {
                submissionData = JSON.parse(submissionData)
              } catch (e) {
                console.error('Error parsing submission:', e)
                submissionData = {}
              }
            }
            
            acc[formName].push({
              ...submissionData,
              id: row.id,
              form_name: row.form_name,
              created_at: row.created_at,
              notes: row.notes
            })
            return acc
          }, {})

          // Create tables for each form_name in creator_log
          Object.entries(creatorLogsByForm).forEach(([formName, submissions]) => {
            // Get all unique columns from submissions, excluding form_name and notes
            const allColumns = new Set<string>()
            submissions.forEach(submission => {
              Object.keys(submission).forEach(key => {
                // Don't add the form_name or notes columns
                if (key !== 'notes' && key !== 'form_name') {
                  allColumns.add(key)
                }
              })
            })

            tables[formName] = {
              formName: formName,
              columns: Array.from(allColumns),
              data: submissions.map(submission => {
                // Create a new object without the notes and form_name fields
                const { notes, form_name, ...submissionWithoutExcluded } = submission
                return submissionWithoutExcluded
              }),
              section: 'Selected Creators'
            }
          })
        }

        // Then process form submissions
        const uniqueFormNames = [...new Set(formSubmissionsData.map(r => r.form_name))]
        console.log('DEBUG - Form submission names:', uniqueFormNames)
        
        uniqueFormNames.forEach(formName => {
          // Only create the 'New Submissions' table for form_name === 'New Submissions'
          if (formName === 'New Submissions') {
            const newSubs = formSubmissionsData.filter(r => r.form_name === 'New Submissions')
            const parsedSubs = newSubs.map(r => {
              let submissionData = r.submission
              if (typeof submissionData === 'string') {
                try {
                  submissionData = JSON.parse(submissionData)
                } catch (e) {
                  console.error('Error parsing submission:', e)
                  submissionData = {}
                }
              }
              return {
                ...submissionData,
                id: r.id,
                created_at: r.created_at,
                notes: r.notes
              }
            })
            // Collect all unique keys for columns
            const allKeys = new Set<string>()
            parsedSubs.forEach(sub => {
              Object.keys(sub).forEach(k => {
                if (k !== 'id' && k !== 'created_at' && k !== 'notes') {
                  allKeys.add(k)
                }
              })
            })
            tables['New Submissions'] = {
              formName: 'New Submissions',
              columns: Array.from(allKeys),
              data: parsedSubs,
              section: 'ALL SUBMISSIONS'
            }
            return
          }

          // All other tables as before
          const formSubmissions = formSubmissionsData.filter(r => r.form_name === formName)
          console.log(`DEBUG - Processing form ${formName} with ${formSubmissions.length} submissions`)
          
          // Parse all submission data and collect key sets
          const parsedSubmissions = formSubmissions.map(r => {
            let submissionData = r.submission
            if (typeof submissionData === 'string') {
              try {
                submissionData = JSON.parse(submissionData)
              } catch (e) {
                console.error('Error parsing submission:', e)
                submissionData = {}
              }
            }
            return {
              ...submissionData,
              id: r.id,
              created_at: r.created_at,
              notes: r.notes
            }
          })
          // Collect all unique keys for columns
          const allKeys = new Set<string>()
          parsedSubmissions.forEach(sub => {
            Object.keys(sub).forEach(k => {
              if (k !== 'id' && k !== 'created_at' && k !== 'notes') {
                allKeys.add(k)
              }
            })
          })
          tables[formName] = {
            formName: formName,
            columns: Array.from(allKeys),
            data: parsedSubmissions,
            section: 'ALL SUBMISSIONS'
          }
        })

        console.log('DEBUG - Final tables:', Object.keys(tables))
        console.log('DEBUG - Creator log table:', tables['Creator Log'])

        const tableArray = Object.values(tables).map(table => ({
          ...table,
          data: table.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }))
        
        setFormTables(tableArray)
        
        // Set the Creator Log as the first active tab if it exists
        if (tableArray.find(t => t.formName === 'Creator Log')) {
          setActiveTab('Creator Log')
        } else if (tableArray.length > 0) {
          setActiveTab(tableArray[0].formName)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const addFilter = () => {
    const newFilter: Filter = { column: '', operator: 'equals', value: '' }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (index: number) => {
    const filterToRemove = filters[index]
    setFilters(filters.filter((_, i) => i !== index))
    // Also remove from active filters
    setActiveFilters(activeFilters.filter(f => 
      !(f.column === filterToRemove.column && f.value === filterToRemove.value)
    ))
  }

  const removeActiveFilter = (index: number) => {
    const filterToRemove = activeFilters[index]
    setActiveFilters(activeFilters.filter((_, i) => i !== index))
    // Also remove from filters
    setFilters(filters.filter(f => 
      !(f.column === filterToRemove.column && f.value === filterToRemove.value)
    ))
  }

  const updateFilter = (index: number, field: keyof Filter, value: any) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], [field]: value }
    setFilters(newFilters)

    // If this is a complete filter (has column, operator, and value), add it to active filters
    if (field === 'value' && newFilters[index].column && newFilters[index].operator) {
      const activeTable = formTables.find(t => t.formName === activeTab);
      const type = getFieldType(value, newFilters[index].column, activeTable || {
        formName: '',
        columns: [],
        data: [],
        section: '',
        columnConfig: {}
      });
      const newActiveFilter = {
        value: value.toString(),
        column: newFilters[index].column,
        type
      };
      if (!activeFilters.some(f => f.value === newActiveFilter.value && f.column === newActiveFilter.column)) {
        setActiveFilters([...activeFilters, newActiveFilter])
      }
    }
  }

  const applyFilters = (data: Record<string, any>[]) => {
    return data.filter(row => {
      return filters.every(filter => {
        const value = row[filter.column]
        if (!value) return false

        switch (filter.operator) {
          case 'equals':
            return value.toString() === filter.value
          case 'contains':
            return value.toString().toLowerCase().includes(filter.value.toString().toLowerCase())
          case 'startsWith':
            return value.toString().toLowerCase().startsWith(filter.value.toString().toLowerCase())
          case 'endsWith':
            return value.toString().toLowerCase().endsWith(filter.value.toString().toLowerCase())
          case 'greaterThan':
            return value > filter.value
          case 'lessThan':
            return value < filter.value
          case 'between':
            const [min, max] = filter.value as [string, string]
            return value >= min && value <= max
          default:
            return true
        }
      })
    })
  }

  // Filter data based on search query and filters
  const filteredData = useMemo(() => {
    const activeTable = formTables.find(table => table.formName === activeTab)
    if (!activeTable) {
      return []
    }

    let data = [...activeTable.data]
    if (searchQuery) {
      data = data.filter(row => 
        activeTable.columns.some(column => {
          const value = row[column]
          return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        })
      )
    }

    if (filters.length > 0) {
      data = applyFilters(data)
    }

    return data
  }, [formTables, activeTab, searchQuery, filters])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDragStart = (e: React.DragEvent, value: string, column: string, type: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ value, column, type }))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData('text/plain'))
    
    // Add to active filters if not already present
    if (!activeFilters.some(f => f.value === data.value && f.column === data.column)) {
      setActiveFilters([...activeFilters, data])
      // Add a filter for the specific column
      setFilters([...filters, { column: data.column, operator: 'equals', value: data.value }])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSaveNotes = async (notes: string) => {
    console.log('Selected submission:', selectedSubmission); // Debug log
    if (!selectedSubmission?.id) {
      console.error('No submission ID found');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ 
          notes: notes
        })
        .eq('submission->>Token', selectedSubmission.id); // Use ->> operator for text comparison in JSONB

      if (error) {
        console.error('Error saving notes:', error);
        throw error;
      }

      // Update the local data
      const updatedTables = formTables.map(table => ({
        ...table,
        data: table.data.map(submission => 
          submission.Token === selectedSubmission.id 
            ? { 
                ...submission, 
                notes: notes 
              }
            : submission
        )
      }));
      setFormTables(updatedTables);
    } catch (error) {
      console.error('Error in handleSaveNotes:', error);
      throw error;
    }
  };

  const handleTabChange = (formName: string) => {
    setActiveTab(formName)
    setSearchQuery('')
    setFilters([])
    setActiveFilters([])
  }

  const renderColumnHeader = (column: string, table: FormTable) => {
    return (
      <div className="flex items-center justify-between group">
        <span
          className="block max-w-[160px] truncate overflow-hidden whitespace-nowrap"
          title={column}
        >
          {column}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedColumn(column);
            setSelectedTable(table.formName);
            setIsColumnConfigOpen(true);
          }}
          className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-300"
          title="Configure column"
        >
          <CogIcon className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    );
  };

  const ColumnConfigModal = () => {
    const table = formTables.find(t => t.formName === selectedTable);
    const currentConfig = table?.columnConfig?.[selectedColumn!] || {};
    
    // Get unique values from the column
    const uniqueValues = useMemo(() => {
      if (!table || !selectedColumn) return [];
      const values = new Set<string>();
      table.data.forEach(row => {
        const value = row[selectedColumn];
        if (value !== undefined && value !== null) {
          values.add(value.toString());
        }
      });
      return Array.from(values);
    }, [table, selectedColumn]);

    // Count occurrences of each value
    const valueCounts = useMemo(() => {
      if (!table || !selectedColumn) return {};
      return table.data.reduce((acc: Record<string, number>, row) => {
        const value = row[selectedColumn]?.toString();
        if (value) {
          acc[value] = (acc[value] || 0) + 1;
        }
        return acc;
      }, {});
    }, [table, selectedColumn]);

    const updateColumnConfig = (value: string, colorClass: string | null) => {
      setFormTables(prevTables => 
        prevTables.map(t => {
          if (t.formName === selectedTable) {
            const newColoredValues = { ...t.columnConfig?.[selectedColumn!]?.coloredValues };
            if (colorClass) {
              newColoredValues[value] = colorClass;
            } else {
              delete newColoredValues[value];
            }
            return {
              ...t,
              columnConfig: {
                ...t.columnConfig,
                [selectedColumn!]: {
                  ...t.columnConfig?.[selectedColumn!],
                  coloredValues: newColoredValues
                }
              }
            };
          }
          return t;
        })
      );
    };

    const colorOptions = [
      { label: 'Light Blue', value: 'bg-blue-100 text-blue-800' },
      { label: 'Light Red', value: 'bg-red-100 text-red-800' },
      { label: 'Light Green', value: 'bg-green-100 text-green-800' },
      { label: 'Light Yellow', value: 'bg-yellow-100 text-yellow-800' },
      { label: 'Light Purple', value: 'bg-purple-100 text-purple-800' },
      { label: 'None', value: null }
    ];

    return (
      <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full ${isColumnConfigOpen ? '' : 'hidden'}`}>
        <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Configure Column: {selectedColumn}
              </h3>
              <button
                onClick={() => setIsColumnConfigOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Values in this column:</h4>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Value</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Count</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Color</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {uniqueValues.map((value) => (
                      <tr key={value} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {value}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {valueCounts[value]}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <select
                            value={currentConfig.coloredValues?.[value] || ''}
                            onChange={(e) => updateColumnConfig(value, e.target.value || null)}
                            className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">No color</option>
                            {colorOptions.map(option => (
                              option.value && (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              )
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleMoveRowsToSelectedCreators = async (fromTableName: string, toTableName: string) => {
    setUndoStack([formTables, ...undoStack]); // Save previous state for undo
    setShowRevert(true);
    setSelectedRows(prev => ({ ...prev, [fromTableName]: new Set() }));
    setMoveTargetTable('');

    // Find the rows to move and the destination columns
    const fromTable = formTables.find(t => t.formName === fromTableName);
    const toTable = formTables.find(t => t.formName === toTableName);
    if (!fromTable || !toTable) return;
    const movingRows = fromTable.data.filter(row => selectedRows[fromTableName]?.has(row.id));
    // Remove from source table
    const newFromData = fromTable.data.filter(row => !selectedRows[fromTableName]?.has(row.id));
    // Use Ollama to map each row
    const mappedRows: Record<string, any>[] = [];
    for (const row of movingRows) {
      try {
        const mapped = await mapRowWithOllama(row, toTable.columns);
        mapped.section = 'Selected Creators';
        mappedRows.push(mapped);
      } catch (e) {
        console.error('Ollama mapping failed for row', row, e);
      }
    }
    const newToData = [...toTable.data, ...mappedRows];
    setFormTables(prevTables => prevTables.map(t => {
      if (t.formName === fromTableName) {
        return { ...t, data: newFromData };
      } else if (t.formName === toTableName) {
        return { ...t, data: newToData };
      }
      return t;
    }));
  }

  const handleRevertMove = () => {
    if (undoStack.length > 0) {
      setFormTables(undoStack[0]);
      setUndoStack([]);
      setShowRevert(false);
    }
  }

  const handleRowSelect = (tableName: string, rowId: string, checked: boolean) => {
    setSelectedRows(prev => {
      const tableSet = new Set(prev[tableName] || [])
      if (checked) {
        tableSet.add(rowId)
      } else {
        tableSet.delete(rowId)
      }
      return { ...prev, [tableName]: tableSet }
    })
  }

  const handleSelectAllRows = (tableName: string, allRowIds: string[], checked: boolean) => {
    setSelectedRows(prev => {
      if (checked) {
        return { ...prev, [tableName]: new Set(allRowIds) }
      } else {
        return { ...prev, [tableName]: new Set() }
      }
    })
  }

  if (error) {
    return (
      <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#f0e7df]">
        <h3 className="text-[#f0e7df] font-medium">Error</h3>
        <p className="text-[#f0e7df]/70 mt-1">{error}</p>
        <div className="mt-4">
          <p className="text-[#f0e7df]/70">Please check:</p>
          <ul className="list-disc list-inside mt-2 text-[#f0e7df]/70">
            <li>You have the correct permissions</li>
            <li>The table exists in your Supabase database</li>
          </ul>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f0e7df]"></div>
      </div>
    )
  }

  const activeTable = formTables.find(table => table.formName === activeTab)
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startRow = pageIndex * pageSize
  const endRow = Math.min(startRow + pageSize, filteredData.length)

  const renderCellContent = (value: any, type: string) => {
    if (value === null || value === undefined) {
      return '-'
    }

    if (typeof value === 'object' && value !== null) {
      // Convert any object to a string representation
      return JSON.stringify(value)
    }

    if (type === 'currency' && !value.toString().startsWith('$')) {
      return `$${value}`
    }

    if (type === 'link' && value.toString().startsWith('http')) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
          {value}
        </a>
      )
    }
    
    return value.toString()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex">
        {/* Collapsible Folder Navigation Sidebar */}
        <div 
          className="w-12 hover:w-64 group transition-all duration-300 ease-in-out border-r border-gray-100 relative bg-white"
        >
          {/* Collapsed State Icon */}
          <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center group-hover:opacity-0 transition-opacity">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          {/* Expanded State Content */}
          <div className="absolute inset-y-0 left-0 w-64 opacity-0 group-hover:opacity-100 transition-opacity p-4 pointer-events-none group-hover:pointer-events-auto">
            <div className="space-y-6">
              {Object.entries(groupedTables).map(([section, tables]) => (
                <div key={section}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 whitespace-nowrap">
                    {section}
                  </h3>
                  <div className="space-y-1">
                    {tables.map((table) => (
                      <div key={table.formName} className="flex items-center">
                        <button
                          onClick={() => handleTabChange(table.formName)}
                          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                            activeTab === table.formName
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate">{table.formName}</span>
                          <span className="ml-auto text-xs text-gray-400">{table.data.length}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Table Content */}
        <div className="flex-1 min-w-0 overflow-auto">
          <div className="p-6">
        {formTables.map((table) => (
          <div
            key={table.formName}
            className={activeTab === table.formName ? 'block' : 'hidden'}
          >
            {/* Action Bar for moving selected rows */}
            {(selectedRows[table.formName]?.size > 0 || showRevert) && (
              <div className="mb-2 flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2 rounded">
                <span className="text-blue-700 text-xs font-semibold">
                  {selectedRows[table.formName]?.size > 0
                    ? `${selectedRows[table.formName].size} row${selectedRows[table.formName].size > 1 ? 's' : ''} selected`
                    : showRevert ? 'Move completed.' : ''}
                </span>
                <div className="flex items-center space-x-2">
                  {selectedRows[table.formName]?.size > 0 && (
                    <>
                      <select
                        value={moveTargetTable}
                        onChange={e => setMoveTargetTable(e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="">Select destination...</option>
                        {formTables.filter(t => t.section === 'Selected Creators').map(t => (
                          <option key={t.formName} value={t.formName}>{t.formName}</option>
                        ))}
                      </select>
                      <button
                        onClick={async () => moveTargetTable && await handleMoveRowsToSelectedCreators(table.formName, moveTargetTable)}
                        className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={!moveTargetTable}
                      >
                        Move to Selected Creators
                      </button>
                    </>
                  )}
                  {showRevert && (
                    <button
                      onClick={handleRevertMove}
                      className="ml-2 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-700"
                    >
                      Revert
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      <input
                        type="checkbox"
                        checked={filteredData.slice(startRow, endRow).every(row => selectedRows[table.formName]?.has(row.id)) && filteredData.slice(startRow, endRow).length > 0}
                        onChange={e => handleSelectAllRows(table.formName, filteredData.slice(startRow, endRow).map(row => row.id), e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      #
                    </th>
                    {table.columns.map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
                      >
                        {renderColumnHeader(column, table)}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.slice(startRow, endRow).map((row, index) => (
                    <tr key={row.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedRows[table.formName]?.has(row.id) || false}
                          onChange={e => handleRowSelect(table.formName, row.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                        {startRow + index + 1}
                      </td>
                      {table.columns.map((column) => {
                        const value = row[column]
                        const type = getFieldType(value, column, table)
                        const colorClass = getFieldColor(type, value?.toString() || '-', column, table)
                        return (
                          <td
                            key={column}
                            className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-200"
                          >
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} cursor-move`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, value?.toString() || '-', column, type)}
                            >
                              <Tooltip content={type === 'currency' && !value?.toString().startsWith('$') ? `$${value}` : value?.toString() || '-'}>
                                <div className="truncate max-w-[150px]">
                                  {renderCellContent(value, type)}
                                </div>
                              </Tooltip>
                            </span>
                          </td>
                        )
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                        <button
                          onClick={() => {
                            setSelectedSubmission({ 
                              id: row.id, 
                              notes: row.notes || '', 
                              submission: row 
                            })
                            setIsNotesModalOpen(true)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Add notes"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 px-4">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                  disabled={pageIndex === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
                  disabled={pageIndex >= totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startRow + 1}</span> to{' '}
                    <span className="font-medium">{endRow}</span> of{' '}
                    <span className="font-medium">{filteredData.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                      disabled={pageIndex === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 shadow-sm"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
                      disabled={pageIndex >= totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 shadow-sm"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        ))}
          </div>
        </div>
      </div>
      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        submissionId={selectedSubmission?.id || ''}
        currentNotes={selectedSubmission?.notes || ''}
        onSave={handleSaveNotes}
      />
      <ColumnConfigModal />
    </div>
  )
} 