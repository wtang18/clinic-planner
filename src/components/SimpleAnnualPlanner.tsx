'use client'

interface SimpleAnnualPlannerProps {
  currentYear: number
  onYearChange: (year: number) => void
  onAddEvent: (month: number) => void
}

export default function SimpleAnnualPlanner({ currentYear, onYearChange, onAddEvent }: SimpleAnnualPlannerProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const previousYear = () => {
    onYearChange(currentYear - 1)
  }

  const nextYear = () => {
    onYearChange(currentYear + 1)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          {currentYear} Annual Planner
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={previousYear}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            type="button"
          >
            ← {currentYear - 1}
          </button>
          <button
            onClick={nextYear}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            type="button"
          >
            {currentYear + 1} →
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {monthNames.map((month, index) => {
            const monthNumber = index + 1
            const currentDate = new Date()
            const isCurrentMonth = currentDate.getMonth() + 1 === monthNumber &&
                                 currentDate.getFullYear() === currentYear

            return (
              <div
                key={month}
                className={`bg-gray-50 rounded-lg p-4 min-h-[200px] border-2 transition-all hover:shadow-md ${
                  isCurrentMonth ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${
                    isCurrentMonth ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {month}
                  </h3>
                </div>

                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm mb-3">
                    No events planned
                  </div>
                  <button
                    onClick={() => onAddEvent(monthNumber)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    type="button"
                  >
                    Add Event
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}