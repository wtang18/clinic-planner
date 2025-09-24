'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import CleanAnnualPlanner from '@/components/CleanAnnualPlanner'
import CleanTimelineView from '@/components/CleanTimelineView'

function HomeContent() {
  const router = useRouter()
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentView, setCurrentView] = useState<'annual' | 'timeline'>('annual')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [refreshKey, setRefreshKey] = useState(0)

  // Get search params safely
  let searchParams: URLSearchParams | null = null
  try {
    searchParams = useSearchParams()
  } catch (error) {
    console.log('Search params not available during SSR')
  }

  // This effect should run whenever searchParams changes
  useEffect(() => {
    if (searchParams) {
      const view = searchParams.get('view')
      const month = searchParams.get('month')
      const year = searchParams.get('year')

      // Update view
      if (view === 'timeline' || view === 'annual') {
        setCurrentView(view)
      }

      // Update month
      if (month) {
        const monthNum = parseInt(month)
        if (monthNum >= 1 && monthNum <= 12) {
          setSelectedMonth(monthNum)
        }
      }

      // Update year
      if (year) {
        const yearNum = parseInt(year)
        if (yearNum >= 2020 && yearNum <= 2030) {
          setSelectedYear(yearNum)
          setCurrentYear(yearNum)
        }
      }
    }
  }, [searchParams?.toString()])

  const handleYearChange = (year: number) => {
    setCurrentYear(year)
    // Update URL to maintain state
    const params = new URLSearchParams()
    params.set('view', currentView)
    params.set('year', year.toString())
    if (currentView === 'timeline') {
      params.set('month', selectedMonth.toString())
    }
    router.push(`/?${params.toString()}`)
  }

  const handleViewChange = (view: 'annual' | 'timeline') => {
    setCurrentView(view)
    // Update URL to maintain state
    const params = new URLSearchParams()
    params.set('view', view)
    if (view === 'timeline') {
      params.set('month', selectedMonth.toString())
      params.set('year', selectedYear.toString())
    } else {
      params.set('year', currentYear.toString())
    }
    router.push(`/?${params.toString()}`)
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">

              {/* Title Section */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Clinic Outreach Planner
                </h1>
              </div>

              {/* Controls Section */}
              <div className="flex items-center space-x-4 mt-6 sm:mt-0">

                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleViewChange('annual')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === 'annual'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Annual View
                  </button>
                  <button
                    onClick={() => handleViewChange('timeline')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === 'timeline'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Month View
                  </button>
                </div>

                {/* Add Event Button */}
                <button
                  onClick={navigateToAddEvent}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  type="button"
                >
                  <span className="mr-2">+</span>
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {currentView === 'annual' ? (
            <CleanAnnualPlanner
              key={`annual-${refreshKey}`}
              currentYear={currentYear}
              onYearChange={handleYearChange}
            />
          ) : (
            <CleanTimelineView
              key={`timeline-${refreshKey}-${selectedMonth}-${selectedYear}`}
              currentYear={currentYear}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}
        </div>

      </div>
    </main>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    </main>
  )
}

// Main component wrapped in Suspense
export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  )
}