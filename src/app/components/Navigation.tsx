'use client'

import { 
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Navigation() {
  return (
    <div className="fixed left-6 top-6 flex flex-col space-y-4">
      <div className="group relative">
        <Link href="/">
          <button className="p-4 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-100">
            <DocumentTextIcon className="h-6 w-6 text-gray-600 group-hover:text-gray-900" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 bg-white rounded-md shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-gray-100">
            <span className="text-sm font-medium text-gray-700">Forms</span>
          </div>
        </Link>
      </div>

      <div className="group relative">
        <Link href="/tasks">
          <button className="p-4 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-100">
            <ClipboardDocumentListIcon className="h-6 w-6 text-gray-600 group-hover:text-gray-900" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 bg-white rounded-md shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-gray-100">
            <span className="text-sm font-medium text-gray-700">Tasks</span>
          </div>
        </Link>
      </div>

      <div className="group relative">
        <button className="p-4 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-100">
          <ChartBarIcon className="h-6 w-6 text-gray-600 group-hover:text-gray-900" />
        </button>
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 bg-white rounded-md shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-gray-100">
          <span className="text-sm font-medium text-gray-700">Analytics</span>
        </div>
      </div>

      <div className="group relative">
        <button className="p-4 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-100">
          <Cog6ToothIcon className="h-6 w-6 text-gray-600 group-hover:text-gray-900" />
        </button>
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 bg-white rounded-md shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-gray-100">
          <span className="text-sm font-medium text-gray-700">Settings</span>
        </div>
      </div>
    </div>
  )
} 