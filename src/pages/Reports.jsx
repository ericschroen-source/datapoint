import { useState } from 'react'
import { useCompanyStore } from '@/stores/companyStore'
import { useCompany } from '@/hooks/useCompany'
import TopBar from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'

const typeConfig = {
  board:    { label: 'Board',        bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-100' },
  mbr:      { label: 'MBR',          bg: 'bg-brand-subtle', text: 'text-brand', border: 'border-brand-subtle' },
  investor: { label: 'Investor',     bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-100' },
  finance:  { label: 'Finance',      bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  product:  { label: 'Product',      bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100' },
  sales:    { label: 'Sales',        bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-100' },
  digest:   { label: 'Digest',       bg: 'bg-zinc-100',   text: 'text-zinc-600',    border: 'border-zinc-200' },
}

const statusConfig = {
  scheduled: { label: 'Scheduled', dot: 'bg-positive',  text: 'text-positive' },
  sent:      { label: 'Sent',      dot: 'bg-brand',     text: 'text-brand' },
  draft:     { label: 'Draft',     dot: 'bg-zinc-300',  text: 'text-zinc-400' },
}

const tabs = ['All', 'Scheduled', 'Sent', 'Draft']

export default function Reports() {
  const { reports } = useCompanyStore()
  const { users, loading } = useCompany()
  const [activeTab, setActiveTab] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = activeTab === 'All'
    ? reports
    : reports.filter(r => r.status === activeTab.toLowerCase())

  function getOwner(ownerId) {
    return users.find(u => u.id === ownerId)
  }

  if (loading || !reports.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const scheduled = reports.filter(r => r.status === 'scheduled').length
  const sent      = reports.filter(r => r.status === 'sent').length
  const draft     = reports.filter(r => r.status === 'draft').length

  return (
    <>
      <TopBar title="Reports" subtitle="Scheduled, sent, and draft reports" />
      <main className="flex-1 overflow-auto px-6 py-6 space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total reports',      value: reports.length, sub: 'across all types' },
            { label: 'Scheduled',          value: scheduled,      sub: 'running automatically' },
            { label: 'Sent this month',    value: sent,           sub: 'delivered to recipients' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-zinc-200 px-5 py-4">
              <p className="text-xs text-zinc-400 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
              <p className="text-xs text-zinc-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Report list + detail ── */}
        <div className="flex gap-4 items-start">

          {/* List */}
          <div className={`bg-white rounded-xl border border-zinc-200 overflow-hidden flex-1 ${selected ? 'min-w-0' : ''}`}>
            {/* Tabs + action */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
              <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 gap-0.5">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeTab === t ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    {t}
                    {t !== 'All' && (
                      <span className="ml-1.5 text-[10px] text-zinc-400">
                        {t === 'Scheduled' ? scheduled : t === 'Sent' ? sent : draft}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <Button size="sm" className="bg-brand hover:bg-brand-hover text-white h-8 px-3 text-xs">
                + New report
              </Button>
            </div>

            {/* Report rows */}
            <div className="divide-y divide-zinc-50">
              {filtered.map((report) => {
                const type    = typeConfig[report.type]
                const status  = statusConfig[report.status]
                const owner   = getOwner(report.owner)
                const isSelected = selected?.id === report.id

                return (
                  <div
                    key={report.id}
                    className={`px-5 py-4 cursor-pointer transition-colors ${isSelected ? 'bg-brand-subtle' : 'hover:bg-zinc-50/60'}`}
                    onClick={() => setSelected(isSelected ? null : report)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Type badge */}
                        <span className={`shrink-0 mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${type.bg} ${type.text} ${type.border}`}>
                          {type.label}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">{report.name}</p>
                          <p className="text-xs text-zinc-400 mt-0.5 truncate">{report.description}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-1.5 justify-end mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                        </div>
                        <p className="text-xs text-zinc-400">{report.cadence}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        Last sent {report.lastSent ? new Date(report.lastSent).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </div>
                      {report.nextRun && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 1v2M4 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                          Next {new Date(report.nextRun).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M1 10c0-1.7 1.3-3 3-3M11 10c0-1.7-1.3-3-3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-72 shrink-0 bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                <p className="text-sm font-semibold text-zinc-900 truncate">{selected.name}</p>
                <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-zinc-700 ml-2 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div>
                  <p className="text-xs text-zinc-400 mb-1.5">Description</p>
                  <p className="text-xs text-zinc-600 leading-relaxed">{selected.description}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-2">Sections</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.sections.map(s => (
                      <span key={s} className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-2">Recipients</p>
                  <div className="space-y-1.5">
                    {selected.recipients.map(r => (
                      <p key={r} className="text-xs text-zinc-600 truncate">{r}</p>
                    ))}
                  </div>
                </div>
                {selected.nextRun && (
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Next scheduled</p>
                    <p className="text-xs font-medium text-zinc-900">
                      {new Date(selected.nextRun).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}
                <div className="pt-1 space-y-2">
                  <Button className="w-full h-8 text-xs bg-brand hover:bg-brand-hover text-white">
                    Run now
                  </Button>
                  <Button variant="outline" className="w-full h-8 text-xs border-zinc-200 text-zinc-600">
                    Edit report
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
