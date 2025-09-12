interface KPICardProps {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
}

const colorClasses = {
  blue: 'bg-primary',
  green: 'bg-success',
  purple: 'bg-secondary',
  orange: 'bg-warning',
  red: 'bg-error',
}

export function KPICard({ title, value, icon, color, change }: KPICardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]} text-white`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm text-base-content/70">{title}</p>
          <p className="headline-2xl text-base-content">{value}</p>
          {change && (
            <p className={`text-sm ${
              change.type === 'increase' ? 'text-success' : 'text-error'
            }`}>
              {change.type === 'increase' ? '↗' : '↘'} {Math.abs(change.value)}%
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
