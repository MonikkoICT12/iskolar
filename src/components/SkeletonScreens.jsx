import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const OverviewSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-200">
    {/* Hero Banner Skeleton */}
    <div className="rounded-2xl gradient-emerald-gold p-6 sm:p-7 shadow-lg shadow-[#587529]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-2.5 flex-1">
        <div className="h-5 w-44 rounded-full bg-white/20 animate-pulse" />
        <div className="h-8 w-72 sm:w-96 rounded-lg bg-white/25 animate-pulse" />
        <div className="h-4 w-64 sm:w-80 rounded-md bg-white/15 animate-pulse" />
      </div>
      <div className="h-14 w-32 rounded-xl bg-white/20 animate-pulse self-start sm:self-auto" />
    </div>

    {/* 4 KPI Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="pt-3 border-t border-border">
              <Skeleton className="h-3.5 w-36" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* 3 Demographic Cards Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-7 w-12 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            <div className="space-y-2.5 pt-2 border-t border-border">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* 2 Bottom Chart / Distribution Cards Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-52" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="w-28 h-28 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-48" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-3.5 pt-1">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-3.5 w-14" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

export const ScholarsTableSkeleton = () => (
  <div className="space-y-4 animate-in fade-in duration-200">
    {/* Compact Search & Filter Bar Skeleton */}
    <Card>
      <CardContent className="p-3">
        <div className="flex flex-col xl:flex-row xl:items-center gap-2.5">
          <Skeleton className="h-9 flex-1 min-w-[220px]" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-[168px]" />
            <Skeleton className="h-9 w-[196px]" />
            <Skeleton className="h-9 w-[148px]" />
            <Skeleton className="h-9 w-[132px]" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Scholars Table Skeleton */}
    <Card className="overflow-hidden">
      <div className="px-4 py-3 bg-[#F6F6F1] border-b border-border grid grid-cols-12 gap-4 items-center">
        <Skeleton className="h-3.5 w-4 col-span-1" />
        <Skeleton className="h-3.5 w-28 col-span-2" />
        <Skeleton className="h-3.5 w-20 col-span-1" />
        <Skeleton className="h-3.5 w-24 col-span-2" />
        <Skeleton className="h-3.5 w-16 col-span-1" />
        <Skeleton className="h-3.5 w-20 col-span-1" />
        <Skeleton className="h-3.5 w-24 col-span-2" />
        <Skeleton className="h-3.5 w-16 col-span-1" />
        <Skeleton className="h-3.5 w-14 col-span-1 ml-auto" />
      </div>

      <div className="divide-y divide-border/75">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            key={idx}
            className={`px-4 py-3.5 grid grid-cols-12 gap-4 items-center ${
              idx % 2 === 1 ? 'bg-[#F1F4E8]' : 'bg-white'
            }`}
          >
            <div className="col-span-1 flex items-center">
              <Skeleton className="h-4 w-4 rounded-[5px]" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-3.5 w-16" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-3.5 w-44" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-4 w-10" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-3.5 w-14" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-3.5 w-32" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="col-span-1 flex justify-end gap-1.5">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3.5 bg-[#F4F5EC] border-t border-border flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-4 w-56" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </Card>
  </div>
)

export const DirectoryTableSkeleton = () => (
  <div className="space-y-5 animate-in fade-in duration-200">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-7 w-32 rounded-full" />
    </div>

    <Card className="overflow-hidden">
      <div className="px-4 py-3 bg-[#F6F6F1] border-b border-border flex items-center justify-between gap-4">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3.5 w-20" />
      </div>

      <div className="divide-y divide-border/75">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            key={idx}
            className={`px-4 py-3.5 flex items-center justify-between gap-4 ${
              idx % 2 === 1 ? 'bg-[#F1F4E8]' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
              <Skeleton className="h-4 w-64 max-w-[65%]" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
)

export const YearLevelSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-200">
    <div className="space-y-2">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="h-7 w-10" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </CardContent>
        </Card>
      ))}
    </div>

    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="space-y-4">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

export const ReportsSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-200">
    <div className="space-y-2">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="w-11 h-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
            <Skeleton className="h-9 w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
    <DirectoryTableSkeleton />
  </div>
)

export const AdminModuleSkeleton = ({ activeTab = 'dashboard' }) => {
  switch (activeTab) {
    case 'scholars':
      return <ScholarsTableSkeleton />
    case 'schools':
    case 'graduates':
      return <DirectoryTableSkeleton />
    case 'yearlevel':
      return <YearLevelSkeleton />
    case 'reports':
      return <ReportsSkeleton />
    case 'dashboard':
    default:
      return <OverviewSkeleton />
  }
}

export const AdminShellSkeleton = ({ activeTab }) => {
  const resolvedTab =
    activeTab ||
    (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('tab') || 'dashboard'
      : 'dashboard')

  return (
    <div className="bg-frosted-canvas min-h-screen flex flex-col w-full">
      <header className="glass-header sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="hidden lg:block h-10 w-[520px] rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="hidden sm:block h-9 w-36 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </header>
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6">
        <AdminModuleSkeleton activeTab={resolvedTab} />
      </main>
    </div>
  )
}

export const LandingPageSkeleton = () => (
  <div className="bg-frosted-canvas min-h-screen flex flex-col w-full">
    <header className="glass-header sticky top-0 z-40 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-44 hidden sm:block" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </header>

    <section className="border-b border-border/80 py-12 sm:py-16 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-5">
        <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl" />
        <Skeleton className="h-10 sm:h-12 w-full max-w-2xl rounded-xl" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <Skeleton className="h-11 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-4">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-2 text-left">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    <section className="w-full px-4 sm:px-6 lg:px-10 py-10 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="w-11 h-11 rounded-xl" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3.5 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  </div>
)
