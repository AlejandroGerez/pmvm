import type { ReactNode } from 'react'

export default function V4Layout({ children }: { children: ReactNode }) {
  return (
    <div className="dark">
      <div className="bg-[#0e0e0e] text-white min-h-screen font-body selection:bg-primary-container selection:text-on-primary-fixed">
        {children}
      </div>
    </div>
  )
}
