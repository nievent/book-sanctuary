"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

type StatusDistribution = {
  name: string
  value: number
  color: string
}

export function StatusDistributionChart({ data }: { data: StatusDistribution[] }) {
  const RADIAN = Math.PI / 180
  
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent === 0) return null

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 600 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="card">
      <h3 className="text-heading-3 font-serif text-ink-900 mb-6">
        Estado de tu Biblioteca
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fdfcfb',
              border: '1px solid #e7e5e4',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {data.map((item) => (
          <div 
            key={item.name}
            className="text-center p-3 rounded-lg"
            style={{ backgroundColor: `${item.color}15` }}
          >
            <p className="text-xs text-ink-600 mb-1">{item.name}</p>
            <p className="text-xl font-bold" style={{ color: item.color }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
