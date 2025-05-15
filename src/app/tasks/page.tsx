'use client'

import { useState } from 'react'
import { 
  ArrowDownTrayIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import Navigation from '../components/Navigation'
import FloatingChat from '../components/FloatingChat'

interface Task {
  id: string
  submitter: string
  submissionDate: string
  projectName: string
  projectOverview: string
  deliverables: string
  technicalSpecs: string
  creativeDirection: string
  dueDate: string
  assignedTo: string
  status: 'pending' | 'in-progress' | 'completed'
}

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
}

const teamMembers: TeamMember[] = [
  { id: '1', name: 'John Smith', role: 'Creative Director', email: 'john@adolescent.com' },
  { id: '2', name: 'Sarah Johnson', role: 'Art Director', email: 'sarah@adolescent.com' },
  { id: '3', name: 'Mike Williams', role: 'Design Lead', email: 'mike@adolescent.com' },
  { id: '4', name: 'Emily Brown', role: 'Senior Designer', email: 'emily@adolescent.com' },
  { id: '5', name: 'David Lee', role: 'Motion Designer', email: 'david@adolescent.com' },
  { id: '6', name: 'Lisa Chen', role: 'UI/UX Designer', email: 'lisa@adolescent.com' },
  { id: '7', name: 'Alex Rodriguez', role: '3D Artist', email: 'alex@adolescent.com' },
  { id: '8', name: 'Rachel Green', role: 'Content Strategist', email: 'rachel@adolescent.com' },
  { id: '9', name: 'Tom Wilson', role: 'Production Manager', email: 'tom@adolescent.com' },
  { id: '10', name: 'Jessica Martinez', role: 'Project Coordinator', email: 'jessica@adolescent.com' }
]

export default function TasksPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [formData, setFormData] = useState({
    submitter: '',
    projectName: '',
    projectOverview: '',
    deliverables: '',
    technicalSpecs: '',
    creativeDirection: '',
    dueDate: '',
    assignedTo: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTask: Task = {
      id: Date.now().toString(),
      ...formData,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    }
    setTasks(prev => [...prev, newTask])
    setFormData({
      submitter: '',
      projectName: '',
      projectOverview: '',
      deliverables: '',
      technicalSpecs: '',
      creativeDirection: '',
      dueDate: '',
      assignedTo: ''
    })
    setIsFormOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#000000] p-6">
      <Navigation />
      <FloatingChat />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#f0e7df]">Creative Request Portal</h1>
            <p className="mt-2 text-[#f0e7df]/70">Track and manage creative project requests</p>
          </div>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-[#1a1a1a] text-[#f0e7df] rounded-md hover:bg-[#2a2a2a] flex items-center space-x-2 border border-[#f0e7df]">
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-[#defe54] text-[#000000] rounded-md hover:bg-[#f0e7df] flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>New Request</span>
            </button>
          </div>
        </div>

        {/* Task Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#1a1a1a] divide-y divide-[#f0e7df]">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#2a2a2a]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#f0e7df]">{task.projectName}</div>
                      <div className="text-sm text-[#f0e7df]/70">{task.projectOverview}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#f0e7df]">{task.submitter}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#f0e7df]">{task.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-[#f0e7df]/50 mr-2" />
                        <span className="text-sm text-[#f0e7df]">{task.assignedTo || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'completed' 
                          ? 'bg-[#defe54] text-[#000000]'
                          : task.status === 'in-progress'
                          ? 'bg-[#1a1a1a] text-[#f0e7df] border border-[#f0e7df]'
                          : 'bg-[#1a1a1a] text-[#f0e7df] border border-[#f0e7df]'
                      }`}>
                        {task.status === 'completed' ? (
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                        ) : task.status === 'in-progress' ? (
                          <ClockIcon className="h-4 w-4 mr-1" />
                        ) : null}
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#f0e7df]">
                      <button className="text-[#defe54] hover:text-[#f0e7df]">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Task Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-[#000000]/75 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#f0e7df]">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#f0e7df] mb-4">New Creative Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f0e7df]">Submitter</label>
                    <select
                      value={formData.submitter}
                      onChange={(e) => setFormData({...formData, submitter: e.target.value})}
                      className="mt-1 block w-full rounded-md bg-[#000000] border-[#f0e7df] text-[#f0e7df] shadow-sm focus:border-[#defe54] focus:ring-[#defe54]"
                      required
                    >
                      <option value="">Select a team member</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.name}>
                          {member.name} - {member.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#f0e7df]">Project Name</label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                      className="mt-1 block w-full rounded-md bg-[#000000] border-[#f0e7df] text-[#f0e7df] shadow-sm focus:border-[#defe54] focus:ring-[#defe54]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f0e7df]">Project Overview</label>
                  <textarea
                    value={formData.projectOverview}
                    onChange={(e) => setFormData({...formData, projectOverview: e.target.value})}
                    className="mt-1 block w-full rounded-md bg-[#000000] border-[#f0e7df] text-[#f0e7df] shadow-sm focus:border-[#defe54] focus:ring-[#defe54]"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f0e7df]">Deliverables</label>
                  <textarea
                    value={formData.deliverables}
                    onChange={(e) => setFormData({...formData, deliverables: e.target.value})}
                    className="mt-1 block w-full rounded-md bg-[#000000] border-[#f0e7df] text-[#f0e7df] shadow-sm focus:border-[#defe54] focus:ring-[#defe54]"
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f0e7df]">Technical Specifications</label>
                  <textarea
                    value={formData.technicalSpecs}
                    onChange={(e) => setFormData({...formData, technicalSpecs: e.target.value})}
                    className="mt-1 block w-full rounded-md bg-[#000000] border-[#f0e7df] text-[#f0e7df] shadow-sm focus:border-[#defe54] focus:ring-[#defe54]"
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f0e7df]">Creative Direction</label>
                  <textarea
                    value={formData.creativeDirection}
                    onChange={(e) => setFormData({...formData, creativeDirection: e.target.value})}
                    className="mt-1 block w-full rounded-md bg-[#000000] border-[#f0e7df] text-[#f0e7df] shadow-sm focus:border-[#defe54] focus:ring-[#defe54]"
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f0e7df]">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="mt-1 block w-full rounded-md bg-[#000000] border-[#f0e7df] text-[#f0e7df] shadow-sm focus:border-[#defe54] focus:ring-[#defe54]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#f0e7df]">Assign To</label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                      className="mt-1 block w-full rounded-md bg-[#000000] border-[#f0e7df] text-[#f0e7df] shadow-sm focus:border-[#defe54] focus:ring-[#defe54]"
                    >
                      <option value="">Select a team member</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.name}>
                          {member.name} - {member.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-[#f0e7df] rounded-md text-[#f0e7df] hover:bg-[#2a2a2a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#defe54] text-[#000000] rounded-md hover:bg-[#f0e7df]"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 