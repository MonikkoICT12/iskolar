import { useState, useMemo } from 'react'
import { Check, School as SchoolIcon, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const HighlightText = ({ text, search }) => {
  if (!search) return <>{text}</>
  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return <>{text}</>

  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const splitRegex = new RegExp(`(${escaped.join('|')})`, 'gi')
  const matchRegex = new RegExp(`^(${escaped.join('|')})$`, 'i')
  const parts = String(text).split(splitRegex)

  return (
    <>
      {parts.map((part, idx) =>
        matchRegex.test(part) ? (
          <strong key={idx} className="font-bold text-brand">
            {part}
          </strong>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  )
}

const SchoolAutocomplete = ({
  value,
  onChange,
  onSelect,
  existingSchools = [],
  isEditMode = false,
  required = true,
  placeholder = 'Type school name or select from existing...',
  className = '',
}) => {
  const [open, setOpen] = useState(false)

  const filteredSchools = useMemo(() => {
    if (!value) return existingSchools
    const searchWords = value.toLowerCase().split(/\s+/).filter(Boolean)
    return existingSchools.filter((school) => {
      const lower = school.toLowerCase()
      return searchWords.every((word) => lower.includes(word))
    })
  }, [value, existingSchools])

  const handleInputChange = (e) => {
    onChange(e.target.value)
    setOpen(true)
  }

  const handleSchoolSelect = (school) => {
    onSelect(school)
    setOpen(false)
  }

  const handleCreateNewSchool = () => {
    const normalizedName = (value || '').trim().replace(/\s+/g, ' ')
    if (normalizedName) {
      onSelect(normalizedName)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={cn('relative', className)}>
          <Input
            type="text"
            name="school"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            required={required}
            placeholder={placeholder}
            autoComplete="off"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[var(--radix-popover-trigger-width)] p-1.5 max-h-60 overflow-y-auto z-[150]"
      >
        {filteredSchools.length > 0 ? (
          <div className="space-y-0.5">
            {filteredSchools.map((school) => {
              const isSelected = value === school
              return (
                <button
                  key={school}
                  type="button"
                  onClick={() => handleSchoolSelect(school)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-sm transition-colors hover:bg-accent',
                    isSelected && 'bg-brand/15 font-semibold text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    <SchoolIcon className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                    <span className="truncate">
                      <HighlightText text={school} search={value} />
                    </span>
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-brand flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        ) : value ? (
          <div className="p-2">
            {!isEditMode ? (
              <button
                type="button"
                onClick={handleCreateNewSchool}
                className="w-full text-left p-2 rounded-lg hover:bg-accent/70 transition-colors"
              >
                <p className="text-xs font-semibold text-brand flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Use &ldquo;{value.trim().replace(/\s+/g, ' ')}&rdquo; as a new school
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  This school will be registered automatically
                </p>
              </button>
            ) : (
              <p className="text-xs text-muted-foreground px-1">
                No matching schools found.
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground p-2">
            Start typing a school name...
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default SchoolAutocomplete
