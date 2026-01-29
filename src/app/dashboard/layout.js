import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--gradient-from), var(--gradient-via), var(--gradient-to))' }}>
      <Sidebar />
      <div className="ml-72 flex-1">
        {children}
      </div>
    </div>
  )
}
