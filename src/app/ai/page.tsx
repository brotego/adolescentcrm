'use client'

import { useState } from 'react'
import { 
  SparklesIcon, 
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import Navigation from '../components/Navigation'
import FloatingChat from '../components/FloatingChat'

export default function AIPage() {
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')

    // TODO: Add AI response logic here
    // For now, just add a placeholder response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm your AI assistant. I can help you analyze your form data, generate insights, and answer questions about your submissions." 
      }])
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <FloatingChat />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 px-4">
        {activeTab === 'chat' ? (
          <div className="flex flex-col h-[calc(100vh-3rem)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-6 mb-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <SparklesIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Welcome to AI Assistant</h3>
                  <p className="mt-2 text-gray-600 max-w-md">
                    Ask me anything about your form submissions and I'll help you analyze the data.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmit} className="sticky bottom-0 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your form data..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-12">
            <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
            <p className="mt-2 text-gray-600">
              AI-powered insights about your form submissions will be available here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 