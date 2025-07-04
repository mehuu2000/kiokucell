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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-slideIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{content.title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          {content.sections.map((section, index) => (
            <div key={index} className="group">
              <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                <span className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </span>
                {section.heading}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line pl-11">{section.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}