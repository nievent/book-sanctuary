"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type ReadingPaceData = {
  month: string
  monthShort: string
  avgDays: number | null
  booksCompleted: number
}

type ReadingPaceChartProps = {
  data: ReadingPaceData[]
  overallAverage: number
}

export function ReadingPaceChart({ data, overallAverage }: ReadingPaceChartProps) {
  // Filtrar meses sin datos
  const validData = data.filter(d => d.avgDays !== null)

  // Calcular tendencia (comparar primeros 3 meses vs últimos 3 meses)
  const firstHalf = validData.slice(0, Math.ceil(validData.length / 2))
  const secondHalf = validData.slice(Math.ceil(validData.length / 2))

  const firstAvg = firstHalf.length > 0
    ? firstHalf.reduce((sum, d) => sum + (d.avgDays || 0), 0) / firstHalf.length
    : 0

  const secondAvg = secondHalf.length > 0
    ? secondHalf.reduce((sum, d) => sum + (d.avgDays || 0), 0) / secondHalf.length
    : 0

  let trend: 'up' | 'down' | 'stable' = 'stable'
  let trendText = 'Ritmo estable'
  let trendColor = 'text-ink-600'
  let TrendIcon = Minus

  if (firstAvg > 0 && secondAvg > 0) {
    const diff = ((secondAvg - firstAvg) / firstAvg) * 100
    
    if (diff < -10) {
      trend = 'up'
      trendText = '¡Estás leyendo más rápido!'
      trendColor = 'text-emerald-600'
      TrendIcon = TrendingUp
    } else if (diff > 10) {
      trend = 'down'
      trendText = 'Te estás tomando más tiempo'
      trendColor = 'text-blue-600'
      TrendIcon = TrendingDown
    }
  }

  // Mejor y peor mes
  const bestMonth = validData.reduce((best, current) => 
    (current.avgDays || Infinity) < (best.avgDays || Infinity) ? current : best
  , validData[0])

  const slowestMonth = validData.reduce((slowest, current) => 
    (current.avgDays || 0) > (slowest.avgDays || 0) ? current : slowest
  , validData[0])

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-heading-3 font-serif text-ink-900">
            📈 Evolución del Ritmo de Lectura
          </h3>
          <p className="text-sm text-ink-600 mt-1">
            Días promedio para completar un libro por mes
          </p>
        </div>
        
        {validData.length > 1 && (
          <div className={`flex items-center gap-2 px-4 py-2 bg-cream-100 rounded-lg ${trendColor}`}>
            <TrendIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{trendText}</span>
          </div>
        )}
      </div>

      {validData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <defs>
                <linearGradient id="colorPace" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7d8f7d" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#7d8f7d" stopOpacity={0}/>
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
                label={{ 
                  value: 'Días', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: '12px', fill: '#78716c' }
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fdfcfb',
                  border: '1px solid #e7e5e4',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
                labelStyle={{ color: '#1c1917', fontWeight: 600 }}
                formatter={(value: any, name: string) => {
                  if (name === 'avgDays') {
                    return value ? [`${value} días`, 'Promedio'] : ['Sin datos', 'Promedio']
                  }
                  return [value, name]
                }}
              />
              
              {/* Línea de promedio general */}
              {overallAverage > 0 && (
                <ReferenceLine 
                  y={overallAverage} 
                  stroke="#d4c4a8" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: `Promedio: ${overallAverage}d`, 
                    position: 'right',
                    style: { fontSize: '11px', fill: '#78716c' }
                  }}
                />
              )}
              
              <Line 
                type="monotone" 
                dataKey="avgDays" 
                stroke="#7d8f7d" 
                strokeWidth={3}
                dot={{ fill: '#7d8f7d', r: 5 }}
                activeDot={{ r: 7 }}
                connectNulls={false}
                name="avgDays"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Estadísticas adicionales */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-xs text-ink-600 mb-1">Mejor mes</p>
              <p className="text-2xl font-bold text-emerald-700">
                {bestMonth?.avgDays || 0}
              </p>
              <p className="text-xs text-ink-500 mt-1">{bestMonth?.month}</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-ink-600 mb-1">Más pausado</p>
              <p className="text-2xl font-bold text-blue-700">
                {slowestMonth?.avgDays || 0}
              </p>
              <p className="text-xs text-ink-500 mt-1">{slowestMonth?.month}</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-xs text-ink-600 mb-1">Promedio general</p>
              <p className="text-2xl font-bold text-purple-700">
                {overallAverage}
              </p>
              <p className="text-xs text-ink-500 mt-1">días/libro</p>
            </div>

            <div className="text-center p-4 bg-sage-50 rounded-lg">
              <p className="text-xs text-ink-600 mb-1">Meses con datos</p>
              <p className="text-2xl font-bold text-sage-700">
                {validData.length}
              </p>
              <p className="text-xs text-ink-500 mt-1">de 6 meses</p>
            </div>
          </div>

          {/* Insight personalizado */}
          <div className="mt-6 p-4 bg-gradient-to-r from-sage-50 to-cream-100 rounded-lg border border-sage-200">
            <p className="text-sm text-ink-700">
              {trend === 'up' && (
                <>
                  <strong>¡Genial!</strong> Tu velocidad de lectura ha mejorado. 
                  Pasaste de {Math.round(firstAvg)} días por libro a {Math.round(secondAvg)} días. 
                  {secondAvg < 14 && " ¡Eres un lector/a veloz!"}
                </>
              )}
              {trend === 'down' && (
                <>
                  Últimamente te tomas más tiempo con tus libros ({Math.round(secondAvg)} días vs {Math.round(firstAvg)} días antes). 
                  {secondAvg > 30 ? " Está bien ir sin prisa y disfrutar cada página." : " Nada malo en saborear cada historia."}
                </>
              )}
              {trend === 'stable' && (
                <>
                  Mantienes un ritmo bastante constante de <strong>{overallAverage} días</strong> por libro. 
                  {overallAverage < 15 && " ¡Excelente consistencia!"}
                  {overallAverage >= 15 && overallAverage < 30 && " Un buen equilibrio entre velocidad y comprensión."}
                  {overallAverage >= 30 && " Te tomas tu tiempo para disfrutar cada lectura."}
                </>
              )}
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-sage-600" />
          </div>
          <p className="text-ink-600 mb-2">
            No hay suficientes datos para calcular tu ritmo
          </p>
          <p className="text-sm text-ink-500">
            Completa algunos libros con fechas de inicio y finalización para ver tu evolución
          </p>
        </div>
      )}
    </div>
  )
}