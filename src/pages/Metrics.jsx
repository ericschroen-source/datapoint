import { useState } from 'react'
import { useMetrics } from '@/hooks/useMetrics'
import TopBar from '@/components/layout/TopBar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Cell
} from 'recharts'

function fmt(v, f) {
  if (f === 'currency') return v >= 1000000 ? `$${(v/1000000).toFixed(2)}M` : v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`
  if (f === 'percent') return `${v}%`
  return v.toLocaleString()
}

function pct(value, prev) {
  const c = (((value - prev) / prev) * 100).toFixed(1)
  return { val: c, up: c > 0 }
}

function StatCard({ label, value, format, prev, invert }) {
  const { val, up } = pct(value, prev)
  const positive = invert ? !up : up
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <p className="text-xs text-zinc-400 mb-3">{label}</p>
      <p className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">{fmt(value, format)}</p>
      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? 'bg-positive-subtle text-positive' : 'bg-negative-subtle text-negative'}`}>
        {up ? '↑' : '↓'} {Math.abs(val)}% vs last month
      </span>
    </div>
  )
}

function WaterfallTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="font-semibold">${Math.abs(payload[0].value / 1000).toFixed(1)}k</p>
    </div>
  )
}

function RetentionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="font-semibold">{payload[0].value}% retained</p>
    </div>
  )
}

export default function Metrics() {
  const { metrics, loading } = useMetrics()
  const [activeSegment, setActiveSegment] = useState(null)

  if (loading || !metrics) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { snapshot, waterfall, segments, retention, product, monthly } = metrics

  return (
    <>
      <TopBar title="Metrics" subtitle="Revenue, retention, and product health" />
      <main className="flex-1 overflow-auto px-6 py-6 space-y-5">

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="MRR"         value={snapshot.mrr.value}         prev={snapshot.mrr.prev}         format="currency" />
          <StatCard label="ARR"         value={snapshot.arr.value}         prev={snapshot.arr.prev}         format="currency" />
          <StatCard label="NRR"         value={snapshot.nrr.value}         prev={snapshot.nrr.prev}         format="percent" />
          <StatCard label="Churn Rate"  value={snapshot.churn.value}       prev={snapshot.churn.prev}       format="percent"  invert />
        </div>

        {/* ── MRR Waterfall + Segment Breakdown ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Waterfall */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">MRR Waterfall — March 2025</h3>
            <p className="text-xs text-zinc-400 mb-5">How MRR moved from start to end of month</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={waterfall} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(Math.abs(v)/1000).toFixed(0)}k`} width={42} />
                <Tooltip content={<WaterfallTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {waterfall.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.type === 'start' || entry.type === 'end' ? '#6366f1'
                        : entry.type === 'positive' ? '#059669'
                        : '#e11d48'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Segment breakdown */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">Revenue by Segment</h3>
            <p className="text-xs text-zinc-400 mb-5">Current MRR split across customer tiers</p>

            {/* Visual bar */}
            <div className="flex h-3 rounded-full overflow-hidden mb-5">
              {segments.map((s) => (
                <div key={s.name} style={{ width: `${(s.mrr / 124800 * 100).toFixed(1)}%`, background: s.color }} />
              ))}
            </div>

            <div className="space-y-3">
              {segments.map((s) => (
                <div
                  key={s.name}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl border cursor-pointer transition-all ${
                    activeSegment === s.name ? 'border-brand bg-brand-subtle' : 'border-zinc-100 hover:border-zinc-200 bg-zinc-50/50'
                  }`}
                  onClick={() => setActiveSegment(activeSegment === s.name ? null : s.name)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{s.name}</p>
                      <p className="text-xs text-zinc-400">{s.customers} customers · ${s.arpu.toLocaleString()} ARPU</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900">${(s.mrr/1000).toFixed(1)}k</p>
                    <p className="text-xs text-zinc-400">{(s.mrr/124800*100).toFixed(1)}% of MRR</p>
                  </div>
                </div>
              ))}
            </div>

            {activeSegment && (() => {
              const s = segments.find(x => x.name === activeSegment)
              return (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                    <p className="text-xs text-zinc-400 mb-1">Churn Rate</p>
                    <p className="text-sm font-semibold text-zinc-900">{s.churn}%</p>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                    <p className="text-xs text-zinc-400 mb-1">NRR</p>
                    <p className="text-sm font-semibold text-zinc-900">{s.nrr}%</p>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* ── Retention + Product Health ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Retention curve */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">Average Retention Curve</h3>
            <p className="text-xs text-zinc-400 mb-5">% of cohort still active by month</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={retention.average} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={38} />
                <Tooltip content={<RetentionTooltip />} />
                <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>

            {/* Cohort table */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left text-zinc-400 font-medium pb-2 pr-4">Cohort</th>
                    {['M0','M1','M2','M3','M4','M5'].map(m => (
                      <th key={m} className="text-center text-zinc-400 font-medium pb-2 px-2">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {retention.cohorts.map((c) => (
                    <tr key={c.cohort}>
                      <td className="py-2 pr-4 font-medium text-zinc-700">{c.cohort}</td>
                      {['m0','m1','m2','m3','m4','m5'].map((m) => (
                        <td key={m} className="py-2 px-2 text-center">
                          {c[m] != null ? (
                            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                              c[m] >= 95 ? 'bg-positive-subtle text-positive'
                              : c[m] >= 88 ? 'bg-brand-subtle text-brand'
                              : 'bg-zinc-100 text-zinc-500'
                            }`}>
                              {c[m]}%
                            </span>
                          ) : <span className="text-zinc-200">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product health */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">Product Health</h3>
            <p className="text-xs text-zinc-400 mb-5">Usage and engagement metrics</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'DAU',         value: product.dau,         prev: product.dauPrev,         suffix: '' },
                { label: 'MAU',         value: product.mau,         prev: product.mauPrev,         suffix: '' },
                { label: 'Stickiness',  value: product.stickiness,  prev: product.stickinessPrev,  suffix: '%' },
              ].map((m) => {
                const { val, up } = pct(m.value, m.prev)
                return (
                  <div key={m.label} className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                    <p className="text-xs text-zinc-400 mb-1">{m.label}</p>
                    <p className="text-lg font-bold text-zinc-900">{m.value.toLocaleString()}{m.suffix}</p>
                    <p className={`text-xs mt-0.5 font-medium ${up ? 'text-positive' : 'text-negative'}`}>
                      {up ? '↑' : '↓'} {Math.abs(val)}%
                    </p>
                  </div>
                )
              })}
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-700 mb-3">Feature Adoption</p>
              <div className="space-y-3">
                {product.featureAdoption.map((f) => (
                  <div key={f.feature}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-zinc-600">{f.feature}</span>
                      <span className="text-xs font-semibold text-zinc-900">{f.adoption}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-all"
                        style={{ width: `${f.adoption}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Avg session length</p>
                <p className="text-lg font-bold text-zinc-900 mt-0.5">{product.avgSession} min</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-negative-subtle text-negative">
                ↓ {(((product.avgSessionPrev - product.avgSession) / product.avgSessionPrev) * 100).toFixed(0)}% vs last month
              </span>
            </div>
          </div>
        </div>

        {/* ── Full MRR table ── */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-5">MRR History — Last 12 Months</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Month','MRR','New MRR','Expansion','Contraction','Churned','Net New','Users'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-zinc-400 pb-3 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {[...monthly].reverse().map((row, i) => {
                  const net = row.newMrr + row.expansion - row.contraction - row.churnedMrr
                  return (
                    <tr key={i} className={i === 0 ? 'font-medium' : ''}>
                      <td className="py-3 pr-4 text-zinc-900">{row.month}</td>
                      <td className="py-3 pr-4 text-zinc-700">${(row.mrr/1000).toFixed(1)}k</td>
                      <td className="py-3 pr-4 text-positive">+${(row.newMrr/1000).toFixed(1)}k</td>
                      <td className="py-3 pr-4 text-positive">+${(row.expansion/1000).toFixed(1)}k</td>
                      <td className="py-3 pr-4 text-warning">-${(row.contraction/1000).toFixed(1)}k</td>
                      <td className="py-3 pr-4 text-negative">-${(row.churnedMrr/1000).toFixed(1)}k</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${net > 0 ? 'bg-positive-subtle text-positive' : 'bg-negative-subtle text-negative'}`}>
                          {net > 0 ? '+' : ''}${(net/1000).toFixed(1)}k
                        </span>
                      </td>
                      <td className="py-3 text-zinc-500">{row.users.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </>
  )
}
