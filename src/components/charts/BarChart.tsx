interface BarChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
}

export function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No hay datos disponibles
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-600 truncate">
                {item.label}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    item.color || 'bg-blue-500'
                  }`}
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                  }}
                />
              </div>
              <div className="w-12 text-sm text-gray-900 text-right">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
