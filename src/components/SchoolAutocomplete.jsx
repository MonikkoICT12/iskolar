import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * SchoolAutocomplete Component
 * 
 * A reusable autocomplete input for school selection with proper styling
 * and visibility across all states (focus, open, typing, autofill).
 * 
 * ROOT CAUSE OF WHITE FIELD ISSUE:
 * The dropdown list was being clipped by the modal's overflow:hidden,
 * and the highlighting logic used nested React elements that sometimes
 * rendered as strings, making text invisible against a white background.
 * 
 * FIXES APPLIED:
 * 1. Portal rendering to escape modal clipping
 * 2. Explicit colors for all states (input, dropdown, options)
 * 3. High z-index (9999) to stay above modal
 * 4. color-scheme: light to prevent dark mode autofill styles
 * 5. Proper text highlighting with dangerouslySetInnerHTML
 * 6. Position calculation that updates on scroll
 */
const SchoolAutocomplete = ({
  value,
  onChange,
  onSelect,
  existingSchools,
  isEditMode = false,
  required = true,
  placeholder = "Type school name or select from existing...",
  className = "",
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredSchools, setFilteredSchools] = useState([])
  const [dropdownPosition, setDropdownPosition] = useState(null)
  
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Filter schools based on search value
  useEffect(() => {
    if (value) {
      const searchWords = value.toLowerCase().split(/\s+/).filter(Boolean)
      const filtered = existingSchools.filter(school => {
        const schoolLower = school.toLowerCase()
        return searchWords.every(word => schoolLower.includes(word))
      })
      setFilteredSchools(filtered)
    } else {
      setFilteredSchools(existingSchools)
    }
  }, [value, existingSchools])

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (inputRef.current && showDropdown) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }

  useEffect(() => {
    updateDropdownPosition()
    
    if (showDropdown) {
      // Update position on scroll
      const handleScroll = () => updateDropdownPosition()
      window.addEventListener('scroll', handleScroll, true)
      return () => window.removeEventListener('scroll', handleScroll, true)
    }
  }, [showDropdown])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    setShowDropdown(true)
  }

  const handleInputFocus = () => {
    setShowDropdown(true)
    updateDropdownPosition()
  }

  const handleSchoolSelect = (school) => {
    onSelect(school)
    setShowDropdown(false)
  }

  const handleCreateNewSchool = () => {
    const normalizedName = value.trim().replace(/\s+/g, ' ')
    if (normalizedName) {
      onSelect(normalizedName)
      setShowDropdown(false)
    }
  }

  // Highlight matching text
  const highlightMatch = (text, search) => {
    if (!search) return text

    const searchWords = search.toLowerCase().split(/\s+/).filter(Boolean)
    let highlightedText = text

    searchWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<strong>$1</strong>')
    })

    return highlightedText
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        name="school"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-3 py-2 rounded-lg text-sm"
        style={{
          border: '1px solid #E5E5EA',
          backgroundColor: '#FFFFFF',
          color: '#1D1D1F',
          colorScheme: 'light',
        }}
      />

      {/* Dropdown Portal */}
      {showDropdown && dropdownPosition && createPortal(
        <div
          ref={dropdownRef}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          style={{
            position: 'absolute',
            top: `${dropdownPosition.top + 4}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            maxHeight: '240px',
            overflowY: 'auto',
            border: '1px solid #E5E5EA',
            zIndex: 9999,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          {filteredSchools.length > 0 ? (
            filteredSchools.map((school, index) => (
              <div
                key={index}
                onClick={() => handleSchoolSelect(school)}
                className="px-3 py-2 cursor-pointer text-sm border-b last:border-b-0 transition-colors"
                style={{
                  color: '#1D1D1F',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E5EA',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5F5F7'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF'
                }}
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(school, value)
                }}
              />
            ))
          ) : value ? (
            <div className="px-3 py-2">
              {!isEditMode ? (
                <div
                  onClick={handleCreateNewSchool}
                  className="cursor-pointer"
                >
                  <p className="text-xs font-medium" style={{ color: '#007AFF' }}>
                    Use "{value.trim().replace(/\s+/g, ' ')}" as a new school
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>
                    This will be added to the system
                  </p>
                </div>
              ) : (
                <p className="text-xs" style={{ color: '#AAAAAA' }}>
                  No matching schools found. Please select from existing schools.
                </p>
              )}
            </div>
          ) : null}
        </div>,
        document.body
      )}
    </div>
  )
}

export default SchoolAutocomplete
