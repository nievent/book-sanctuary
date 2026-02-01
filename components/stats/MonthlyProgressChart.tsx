"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type MonthlyData = {
  month: string
  monthShort: string
  pagesRead: number
}

export function PagesReadChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="card">
      <h3 className="text-heading-3 font-serif text-ink-900 mb-6">
        Páginas Leídas por Mes
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#44403c" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#44403c" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis 
            dataKey="monthShort" 
            stroke="#78716c"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#78716c"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fdfcfb',
              border: '1px solid #e7e5e4',
              borderRadius: '8px',
              fontSize: '14px',
            }}
            labelStyle={{ color: '#1c1917', fontWeight: 600 }}
          />
          <Area 
            type="monotone" 
            dataKey="pagesRead" 
            stroke="#44403c" 
            strokeWidth={3}
            fill="url(#colorPages)"
            name="Páginas leídas"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 text-center p-4 bg-ink-50 rounded-lg">
        <p className="text-sm text-ink-600 mb-1">Total últimos 6 meses</p>
        <p className="text-2xl font-bold text-ink-700">
          {data.reduce((sum, d) => sum + d.pagesRead, 0).toLocaleString()} páginas
        </p>
      </div>
    </div>
  )
}