"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type RatingDistribution = {
  range: string
  count: number
}

export function RatingDistributionChart({ data }: { data: RatingDistribution[] }) {
  return (
    <div className="card">
      <h3 className="text-heading-3 font-serif text-ink-900 mb-6">
        Distribución de Valoraciones
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis 
            dataKey="range" 
            stroke="#78716c"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#78716c"
            style={{ fontSize: '12px' }}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fdfcfb',
              border: '1px solid #e7e5e4',
              borderRadius: '8px',
              fontSize: '14px',
            }}
            labelStyle={{ color: '#1c1917', fontWeight: 600 }}
            cursor={{ fill: 'rgba(125, 143, 125, 0.1)' }}
          />
          <Bar 
            dataKey="count" 
            fill="#7d8f7d" 
            radius={[8, 8, 0, 0]}
            name="Libros"
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 text-center p-4 bg-amber-50 rounded-lg">
        <p className="text-sm text-ink-600 mb-1">Libros valorados</p>
        <p className="text-2xl font-bold text-amber-700">
          {data.reduce((sum, d) => sum + d.count, 0)} total
        </p>
      </div>
    </div>
  )
}
