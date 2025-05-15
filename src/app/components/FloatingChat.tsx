'use client'

import { useState } from 'react'
import { SparklesIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
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
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-[#000000] rounded-full shadow-lg hover:bg-[#1a1a1a] transition-colors group border border-[#f0e7df]"
      >
        <SparklesIcon className="h-6 w-6 text-[#defe54] group-hover:text-[#f0e7df]" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-[#000000] rounded-lg shadow-xl border border-[#f0e7df] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#f0e7df] flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-5 w-5 text-[#defe54]" />
              <h3 className="font-medium text-[#f0e7df]">AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[#1a1a1a] rounded-full"
            >
              <XMarkIcon className="h-5 w-5 text-[#f0e7df]" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <SparklesIcon className="h-8 w-8 text-[#f0e7df] mb-2" />
                <h3 className="text-sm font-medium text-[#f0e7df]">How can I help you today?</h3>
                <p className="mt-1 text-xs text-[#f0e7df] max-w-xs">
                  Ask me anything about your form submissions.
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
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      message.role === 'user'
                        ? 'bg-[#defe54] text-[#000000]'
                        : 'bg-[#1a1a1a] text-[#f0e7df] border border-[#f0e7df]'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-[#f0e7df]">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 rounded-lg bg-[#1a1a1a] border border-[#f0e7df] px-3 py-2 text-sm text-[#f0e7df] placeholder-[#f0e7df]/50 focus:outline-none focus:ring-2 focus:ring-[#defe54]"
              />
              <button
                type="submit"
                className="p-2 bg-[#defe54] text-[#000000] rounded-lg hover:bg-[#f0e7df]"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
} 