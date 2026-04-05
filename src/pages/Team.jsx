import { useState } from 'react'
import { useCompany } from '@/hooks/useCompany'
import { useAuthStore } from '@/stores/authStore'
import TopBar from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'

const roleStyles = {
  owner:  'bg-violet-50 text-violet-700 border-violet-100',
  admin:  'bg-sky-50 text-sky-700 border-sky-100',
  viewer: 'bg-zinc-100 text-zinc-600 border-zinc-200',
}

const depts = ['All', 'Executive', 'Finance', 'Product', 'Sales', 'Engineering', 'Marketing']

export default function Team() {
  const { users, loading } = useCompany()
  const { user: currentUser } = useAuthStore()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [selectedUser, setSelectedUser] = useState(null)

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'All' || u.department === deptFilter
    return matchSearch && matchDept
  })

  const deptBreakdown = depts.slice(1).map(d => ({
    dept: d,
    count: users.filter(u => u.department === d).length,
    active: users.filter(u => u.department === d && new Date(u.lastActive) >= new Date(Date.now() - 7*24*60*60*1000)).length,
  })).filter(d => d.count > 0)

  const activeThisWeek = users.filter(u =>
    new Date(u.lastActive) >= new Date(Date.now() - 7*24*60*60*1000)
  ).length

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <TopBar title="Team" subtitle={`${users.length} members across ${deptBreakdown.length} departments`} />
      <main className="flex-1 overflow-auto px-6 py-6 space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total members',    value: users.length,   sub: `${users.filter(u => u.role !== 'viewer').length} with edit access` },
            { label: 'Active this week', value: activeThisWeek, sub: `${users.length - activeThisWeek} not active` },
            { label: 'Departments',      value: deptBreakdown.length, sub: 'with workspace access' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-zinc-200 px-5 py-4">
              <p className="text-xs text-zinc-400 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
              <p className="text-xs text-zinc-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 items-start">

          {/* ── Main table ── */}
          <div className="flex-1 bg-white rounded-xl border border-zinc-200 overflow-hidden min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-100 flex-wrap">
              <input
                type="text"
                placeholder="Search members…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-40 h-9 px-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
              <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 gap-0.5">
                {depts.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDeptFilter(d)}
                    className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                      deptFilter === d ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {(currentUser?.role === 'owner' || currentUser?.role === 'admin') && (
                <Button size="sm" className="bg-brand hover:bg-brand-hover text-white h-9 px-4 shrink-0" onClick={() => setInviteOpen(true)}>
                  + Invite
                </Button>
              )}
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  {['Member', 'Title', 'Role', 'Usage', 'Last active', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-zinc-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map((member) => {
                  const isActive = new Date(member.lastActive) >= new Date(Date.now() - 7*24*60*60*1000)
                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-zinc-50/50 transition-colors cursor-pointer ${selectedUser?.id === member.id ? 'bg-brand-subtle' : ''}`}
                      onClick={() => setSelectedUser(selectedUser?.id === member.id ? null : member)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${member.color}`}>
                              {member.initials}
                            </span>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${isActive ? 'bg-positive' : 'bg-zinc-300'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
                              {member.name}
                              {member.id === currentUser?.id && <span className="text-[10px] text-zinc-400 font-normal">(you)</span>}
                            </p>
                            <p className="text-xs text-zinc-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500">{member.title}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${roleStyles[member.role]}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span title="Dashboards viewed">📊 {member.dashboardsViewed}</span>
                          <span title="Reports run">📄 {member.reportsRun}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-400">
                        {new Date(member.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {currentUser?.role !== 'viewer' && member.id !== currentUser?.id && (
                          <button className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">Manage</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-zinc-400">No members match your filters</div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="w-64 shrink-0 space-y-4">

            {/* Activity feed OR dept breakdown */}
            {selectedUser ? (
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${selectedUser.color}`}>
                      {selectedUser.initials}
                    </span>
                    <p className="text-sm font-medium text-zinc-900">{selectedUser.name.split(' ')[0]}</p>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="text-zinc-400 hover:text-zinc-700">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
                <div className="px-4 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                      <p className="text-xs text-zinc-400 mb-1">Dashboards</p>
                      <p className="text-lg font-bold text-zinc-900">{selectedUser.dashboardsViewed}</p>
                    </div>
                    <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                      <p className="text-xs text-zinc-400 mb-1">Reports</p>
                      <p className="text-lg font-bold text-zinc-900">{selectedUser.reportsRun}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-700 mb-2">Recent activity</p>
                    <div className="space-y-3">
                      {selectedUser.activity.map((a, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs text-zinc-700 leading-relaxed">{a.action}</p>
                            <p className="text-[11px] text-zinc-400 mt-0.5">{a.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-100">
                  <p className="text-sm font-semibold text-zinc-900">By department</p>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {deptBreakdown.map((d) => (
                    <div key={d.dept} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-zinc-900">{d.dept}</p>
                        <p className="text-[11px] text-zinc-400">{d.active} of {d.count} active this week</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: d.count }).map((_, i) => (
                          <span key={i} className={`w-2 h-2 rounded-full ${i < d.active ? 'bg-positive' : 'bg-zinc-200'}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent activity feed */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100">
                <p className="text-sm font-semibold text-zinc-900">Recent activity</p>
              </div>
              <div className="px-4 py-3 space-y-3">
                {users.flatMap(u => u.activity.map(a => ({ ...a, user: u }))).slice(0, 6).map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${a.user.color}`}>
                      {a.user.initials}
                    </span>
                    <div>
                      <p className="text-xs text-zinc-700 leading-snug">{a.action}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setInviteOpen(false)}>
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-zinc-900 mb-1">Invite a team member</h3>
            <p className="text-sm text-zinc-400 mb-5">They'll receive an email with a link to join your workspace.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Email address</label>
                <input type="email" placeholder="colleague@company.com" className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Role</label>
                <select className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white">
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 h-10 border-zinc-200 text-zinc-600" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button className="flex-1 h-10 bg-brand hover:bg-brand-hover text-white" onClick={() => setInviteOpen(false)}>Send invite</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
