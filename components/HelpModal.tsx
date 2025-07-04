'use client'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  content: {
    title: string
    sections: {
      heading: string
      description: string
    }[]
  }
}

export default function HelpModal({ isOpen, onClose, content }: HelpModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">{content.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {content.sections.map((section, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
              <h3 className="font-semibold text-lg mb-2">{section.heading}</h3>
              <p className="text-gray-700 whitespace-pre-line">{section.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}