import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useMetrics } from '@/hooks/useMetrics'
import TopBar from '@/components/layout/TopBar'
import RevenueChart from '@/components/charts/RevenueChart'

function fmt(value, format) {
  if (format === 'currency') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${value.toFixed(2)}`
  }
  if (format === 'percent') return `${value}%`
  return value.toLocaleString()
}

function pctChange(value, prev) {
  return (((value - prev) / prev) * 100).toFixed(1)
}

function MetricCard({ metric }) {
  const change = pctChange(metric.value, metric.prev)
  const isPositive = metric.trend === 'up' ? change > 0 : change < 0
  const isChurn = metric.label === 'Churn Rate'

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-sm transition-shadow">
      <p className="text-xs text-zinc-400 mb-3">{metric.label}</p>
      <p className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
        {fmt(metric.value, metric.format)}
      </p>
      <div className="flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
          isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}%
        </span>
        <span className="text-xs text-zinc-400">vs last month</span>
      </div>
    </div>
  )
}

const alertStyles = {
  milestone: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', icon: '★' },
  positive:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: '↑' },
  info:      { bg: 'bg-zinc-50', text: 'text-zinc-600', dot: 'bg-zinc-400', icon: 'i' },
  warning:   { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', icon: '!' },
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { metrics, loading } = useMetrics()
  const [chartView, setChartView] = useState('mrr')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0]

  if (loading || !metrics) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Loading your data…</p>
        </div>
      </div>
    )
  }

  const { snapshot, monthly, alerts } = metrics
  const metricList = Object.values(snapshot)
  const unreadAlerts = alerts.filter((a) => !a.read)
  const readAlerts = alerts.filter((a) => a.read)

  return (
    <>
      <TopBar
        title="Overview"
        subtitle="Meridian Labs · Executive Dashboard"
      />

      <main className="flex-1 overflow-auto px-6 py-6 space-y-6">

        {/* Greeting + AI summary */}
        <div className="bg-white rounded-xl border border-zinc-200 px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 mb-1">
              {greeting}, {firstName}.
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
              Revenue is up <span className="text-emerald-600 font-medium">12.3%</span> month-over-month and churn just hit its lowest point in 18 months.
              Net Revenue Retention is at <span className="text-indigo-600 font-medium">118%</span> — expansion is outpacing churn.
            </p>
          </div>
          {unreadAlerts.length > 0 && (
            <span className="shrink-0 text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full px-3 py-1">
              {unreadAlerts.length} new alert{unreadAlerts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {metricList.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </div>

        {/* Chart + Alerts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Revenue chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  {chartView === 'mrr' ? 'Monthly Recurring Revenue' : 'Active Users'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Last 12 months</p>
              </div>
              <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 gap-0.5">
                {['mrr', 'users'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                      chartView === v
                        ? 'bg-white text-zinc-900 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    {v === 'mrr' ? 'MRR' : 'Users'}
                  </button>
                ))}
              </div>
            </div>
            <RevenueChart data={monthly} view={chartView} />
          </div>

          {/* Alerts feed */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Alerts</h3>
            <div className="space-y-3">
              {[...unreadAlerts, ...readAlerts].map((alert) => {
                const style = alertStyles[alert.type]
                return (
                  <div key={alert.id} className={`rounded-lg p-3 ${style.bg} ${!alert.read ? 'ring-1 ring-inset ring-indigo-100' : ''}`}>
                    <div className="flex items-start gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 ${style.dot}`}>
                        {style.icon}
                      </span>
                      <div>
                        <p className={`text-xs leading-relaxed ${style.text}`}>{alert.message}</p>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          {new Date(alert.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* MRR movement breakdown */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-5">MRR Movement · Last 3 Months</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Month', 'MRR', 'New MRR', 'Churned MRR', 'Net Change', 'Users'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-zinc-400 pb-3 pr-6 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {monthly.slice(-3).reverse().map((row, i) => {
                  const net = row.newMrr - row.churnedMrr
                  return (
                    <tr key={i}>
                      <td className="py-3 pr-6 text-sm font-medium text-zinc-900">{row.month}</td>
                      <td className="py-3 pr-6 text-sm text-zinc-700">${(row.mrr / 1000).toFixed(1)}k</td>
                      <td className="py-3 pr-6 text-sm text-emerald-600">+${(row.newMrr / 1000).toFixed(1)}k</td>
                      <td className="py-3 pr-6 text-sm text-rose-500">-${(row.churnedMrr / 1000).toFixed(1)}k</td>
                      <td className="py-3 pr-6">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${net > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {net > 0 ? '+' : ''}${(net / 1000).toFixed(1)}k
                        </span>
                      </td>
                      <td className="py-3 text-sm text-zinc-500">{row.users.toLocaleString()}</td>
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
