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

export default function Team() {
  const { users, loading } = useCompany()
  const { user: currentUser } = useAuthStore()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <TopBar title="Team" subtitle={`${users.length} members`} />

      <main className="flex-1 overflow-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-zinc-100">
            <input
              type="text"
              placeholder="Search by name, email, or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 max-w-sm h-9 px-3 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {currentUser?.role === 'owner' || currentUser?.role === 'admin' ? (
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4"
                onClick={() => setInviteOpen(true)}
              >
                + Invite member
              </Button>
            ) : null}
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                {['Member', 'Department', 'Role', 'Last active', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-zinc-400 px-5 py-3 first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${member.color}`}>
                        {member.initials}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
                          {member.name}
                          {member.id === currentUser?.id && (
                            <span className="text-[10px] text-zinc-400 font-normal">(you)</span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-500">{member.department}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${roleStyles[member.role]}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-400">
                    {new Date(member.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {currentUser?.role !== 'viewer' && member.id !== currentUser?.id && (
                      <button className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
                        Manage
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-zinc-400">
              No members match "{search}"
            </div>
          )}
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
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Role</label>
                <select className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 h-10 border-zinc-200 text-zinc-600"
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => setInviteOpen(false)}
              >
                Send invite
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
