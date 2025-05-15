'use client'

import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Navigation from './components/Navigation'
import FloatingChat from './components/FloatingChat'
import DataTable from './components/DataTable'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navigation />
      <main className="ml-20 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Form Submissions</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Submission</span>
          </button>
        </div>
        <DataTable />
      </main>
      <FloatingChat />
    </div>
  )
}
