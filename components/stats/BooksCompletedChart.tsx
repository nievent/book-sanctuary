"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type MonthlyData = {
  month: string
  monthShort: string
  booksCompleted: number
}

export function BooksCompletedChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="card">
      <h3 className="text-heading-3 font-serif text-ink-900 mb-6">
        Libros Completados por Mes
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis 
            dataKey="monthShort" 
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
            dataKey="booksCompleted" 
            fill="#7d8f7d" 
            radius={[8, 8, 0, 0]}
            name="Libros completados"
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 text-center p-4 bg-sage-50 rounded-lg">
        <p className="text-sm text-ink-600 mb-1">Total últimos 6 meses</p>
        <p className="text-2xl font-bold text-sage-700">
          {data.reduce((sum, d) => sum + d.booksCompleted, 0)} libros
        </p>
      </div>
    </div>
  )
}