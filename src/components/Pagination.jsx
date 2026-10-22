import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
      {/* Range info */}
      <p className="text-xs text-slate-600">
        Showing <span className="font-semibold text-slate-900">{startItem}-{endItem}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalItems}</span>
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
            currentPage === 1
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <ChevronLeft className="w-3 h-3" />
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                  ...
                </span>
              )
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                  currentPage === page
                    ? 'bg-lgu-blue text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
            currentPage === totalPages
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Next
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
