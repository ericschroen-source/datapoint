import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 text-white text-xs px-3 py-2.5 rounded-lg shadow-xl">
      <p className="text-zinc-400 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold">
          {p.name === 'mrr'
            ? `$${(p.value / 1000).toFixed(1)}k MRR`
            : `${p.value.toLocaleString()} users`}
        </p>
      ))}
    </div>
  )
}

export default function RevenueChart({ data, view = 'mrr' }) {
  const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#4f46e5'

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={brand} stopOpacity={0.15}/>
            <stop offset="95%" stopColor={brand} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={brand} stopOpacity={0.15}/>
            <stop offset="95%" stopColor={brand} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false}/>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#a1a1aa' }}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#a1a1aa' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => view === 'mrr' ? `$${(v/1000).toFixed(0)}k` : v.toLocaleString()}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: brand, strokeWidth: 1, strokeDasharray: '4 2' }}/>
        <Area
          type="monotone"
          dataKey={view}
          stroke={brand}
          strokeWidth={2}
          fill={view === 'mrr' ? 'url(#mrrGrad)' : 'url(#userGrad)'}
          dot={false}
          activeDot={{ r: 4, fill: brand, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
