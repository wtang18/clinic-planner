'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import MVPAnnualPlanner from '@/components/MVPAnnualPlanner'
import TimelineView from '@/components/TimelineView'

export default function Home() {
  const searchParams = useSearchParams()
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentView, setCurrentView] = useState<'annual' | 'timeline'>('annual')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const view = searchParams.get('view')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (view === 'timeline' || view === 'annual') {
      setCurrentView(view)
    }

    if (month) {
      const monthNum = parseInt(month)
      if (monthNum >= 1 && monthNum <= 12) {
        setSelectedMonth(monthNum)
      }
    }

    if (year) {
      const yearNum = parseInt(year)
      if (yearNum >= 2020 && yearNum <= 2030) {
        setSelectedYear(yearNum)
        setCurrentYear(yearNum)
      }
    }
  }, [searchParams])

  const handleYearChange = (year: number) => {
    setCurrentYear(year)
  }

  const handleEventAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  const navigateToAddEvent = () => {
    const url = currentView === 'timeline'
      ? `/add-event?return=timeline&month=${selectedMonth}&year=${selectedYear}`
      : '/add-event?return=annual'
    window.location.href = url
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">

              {/* Title Section */}
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-lg shadow-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                    Clinic Outreach Planner
                  </h1>
                  <p className="mt-2 text-lg text-gray-600">
                    Plan and manage your clinic's community outreach activities
                  </p>
                </div>
              </div>

              {/* Controls Section */}
              <div className="flex items-center space-x-4 mt-6 sm:mt-0">

                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setCurrentView('annual')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === 'annual'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Annual View
                  </button>
                  <button
                    onClick={() => setCurrentView('timeline')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === 'timeline'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Timeline
                  </button>
                </div>

                {/* Add Event Button */}
                <button
                  onClick={navigateToAddEvent}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  type="button"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8">
          {currentView === 'annual' ? (
            <MVPAnnualPlanner
              key={`annual-${refreshKey}`}
              currentYear={currentYear}
              onYearChange={handleYearChange}
            />
          ) : (
            <div className="space-y-8">
              <TimelineView
                key={`timeline-${refreshKey}`}
                currentYear={currentYear}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </div>
          )}
        </div>

      </div>
    </main>
  )
}