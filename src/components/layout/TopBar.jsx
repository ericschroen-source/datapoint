import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'

export default function TopBar({ title, subtitle }) {
  const { user } = useAuthStore()
  const { metrics } = useCompanyStore()
  const unread = metrics?.alerts?.filter((a) => !a.read).length ?? 0

  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-zinc-900">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Date */}
        <span className="text-xs text-zinc-400 hidden md:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>

        {/* Alerts bell */}
        <button className="relative text-zinc-400 hover:text-zinc-700 transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1a5 5 0 00-5 5v3l-2 2v1h14v-1l-2-2V6a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        {/* Avatar */}
        {user && (
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${user.color}`}>
            {user.initials}
          </span>
        )}
      </div>
    </header>
  )
}
