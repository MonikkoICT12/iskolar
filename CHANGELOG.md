# Changelog

## [1.6.0] - 2026-10-22

### Added - View Scholars Modal in School Summary
- **Modal Popup**: Click "View Scholars" button to open a modal showing all scholars per school
  - Full-screen modal overlay with detailed scholar information
  - Shows Name, LRN, Barangay, Year Level, Semester, Course, Amount, Status
  - Professional modal design with header, body, and footer
  - Summary cards showing totals and averages

### Features
- **Action Button**: Blue "View Scholars" button with eye icon
- **Modal Header**: School name with scholar count
- **Summary Cards**: Total scholars, total amount, average per scholar
- **Detailed Table**: Complete scholar information in clean table
- **Close Button**: X button and Close button to dismiss modal
- **Status Badges**: Color-coded Processing (yellow) and Paid (green) badges
- **Responsive**: Modal adapts to screen size

### Benefits
- ✅ Clean modal interface (not dropdown)
- ✅ Focus on one school at a time
- ✅ Better readability with full-width modal
- ✅ Quick access to school statistics
- ✅ Professional presentation

### UI Improvements
- Added toggle state management
- Nested table with proper styling
- Hover effects on rows
- Color-coded status indicators
- LRN display in smaller text

### Files Modified
- `src/components/SchoolSummary.jsx`
  - Added useState for expand/collapse
  - Added toggleSchool function
  - Added scholar detail table
  - Added View Scholars button
  - Added getStatusBadge function

---

## [1.5.0] - 2026-10-22

### Added - Sample Data Generator
- **Load Sample Data Feature**: One-click button to add 25 sample scholars
  - 5 scholars per university (5 universities in Nueva Ecija)
  - Scholarship amounts vary: ₱15,000 - ₱50,000
  - Realistic Filipino names and contact information
  - Random barangays, year levels, and courses
  - 70% Processing status, 30% Paid status

### Universities Included
1. Nueva Ecija University of Science and Technology (NEUST)
2. Central Luzon State University (CLSU)
3. Wesleyan University - Philippines (WUP)
4. Pampanga State Agricultural University (PSAU) - Nueva Ecija Campus
5. Philippine Normal University (PNU) - Nueva Ecija Extension

### Features
- **Quick Demo Setup**: Perfect for presentations and training
- **Realistic Data**: Authentic Filipino names and courses
- **Varied Amounts**: Random distribution between ₱15k-₱50k
- **One-Click Load**: Instant data population
- **Safe Testing**: Can be cleared anytime

### Use Cases
- ✅ System demonstrations
- ✅ Staff training
- ✅ Feature testing
- ✅ Screenshots and documentation
- ✅ Development testing

### Files Added
- `src/utils/sampleData.js` - Sample data generator
- Updated `src/components/BackupReports.jsx` - Added load button

### Button Location
- Tab: "Backup & Reports"
- Button: "Load Sample Data" (purple button)
- Grid: Updated to 5 columns to accommodate new button

---

## [1.4.0] - 2026-10-22

### Changed - Automatic Status Assignment
- **Status Field Removed from Add Scholar Form**: New scholars automatically get "Processing" status
  - **Before**: Status dropdown visible when adding scholar
  - **After**: Status automatically set to "Processing" on creation

### Status Management
- **Admin-Only Status Changes**: Only admins can change status from Processing to Paid
  - Status field only visible when editing (admin role)
  - Staff can add scholars but cannot change status
  - Clear information note about auto-processing

### Form Improvements
- **Cleaner Add Form**: One less field to fill (faster entry)
- **Role-Based Display**: Form adapts based on user role
- **Visual Feedback**: Info boxes explain status behavior
- **Full-Width Amount**: Amount field uses full width when adding

### Benefits
- ✅ Faster data entry (no status selection needed)
- ✅ Consistent workflow (all start as Processing)
- ✅ Financial control (only admins mark as Paid)
- ✅ Reduced errors (no accidental Paid status)
- ✅ Clear permissions (role-based access)

### Files Modified
- `src/components/ScholarModal.jsx`
  - Added conditional status field rendering
  - Added role-based permission checks
  - Added informational notes
  - Layout adapts to editing mode

---

## [1.3.0] - 2026-10-22

### Added - Excel-Style Form Navigation
- **Enter Key Navigation**: Press Enter in any input field to automatically move to next field
  - Works like Excel for rapid data entry
  - Hands stay on keyboard, no mouse needed
  - 10x faster scholar data entry

### Features
- **Auto-Focus**: First Name field automatically focused when form opens
- **Smart Navigation**: Automatically finds and focuses next input/select field
- **Tab Support**: Standard Tab/Shift+Tab still works as expected
- **Form Order**: Natural top-to-bottom, left-to-right field progression

### Benefits
- ⚡ Much faster data entry (like Excel)
- 📊 Familiar for Excel users
- ⌨️ Keyboard-only workflow
- ✅ Fewer errors with natural flow

### Technical Changes
- Added `handleKeyDown` function to intercept Enter key
- Added `onKeyDown` event handler to form element
- Added `autoFocus` attribute to First Name field
- Enter key moves focus to next form element instead of submitting

### Files Modified
- `src/components/ScholarModal.jsx`
  - Added keyboard navigation logic
  - Enhanced form user experience
  - Implemented Excel-style Enter key behavior

---

## [1.2.1] - 2026-10-22

### Changed - School Cards Made Non-Clickable
- **School Summary Cards**: Removed clickable behavior from dashboard school cards
  - **Before**: Cards were clickable with hover effects and cursor pointer
  - **After**: Cards are view-only displays with no interaction

### Visual Improvements
- **Scholar Count Badge**: Changed from plain text to circular blue badge
  - Blue background (`bg-lgu-blue`)
  - White text
  - Professional circular design (6x6)
  
- **Typography Updates**:
  - Amount text size increased (text-xs → text-sm)
  - Better visual hierarchy with updated spacing
  - Minimum height for consistent card appearance

- **Description Updated**:
  - **Before**: "I-click ang school card para makita ang lahat ng scholars dito"
  - **After**: "University, bilang ng scholars, at kabuuang halaga ng scholarship"

### Files Modified
- `src/components/Dashboard.jsx`
  - Removed `cursor-pointer` class
  - Removed `hover:shadow-md` transition
  - Updated scholar count to circular badge
  - Enhanced card styling and layout

### Purpose
- Cards now clearly show they are informational only
- Users view school statistics without expecting interaction
- Better UX with clear separation of data display vs navigation

---

## [1.2.0] - 2026-10-22

### Changed - Year Levels Updated
- **Year Level Options**: Changed from 6 options to 4 college levels only
  - **Before**: 1st Year, 2nd Year, 3rd Year, 4th Year, SHS Grade 11, SHS Grade 12
  - **After**: 1st Year, 2nd Year, 3rd Year, 4th Year (College only)
  
### Added - Semester Field
- **New Field**: Semester dropdown added to scholar form
  - **Options**: 1st Sem, 2nd Sem
  - **Required**: Yes
  - **Default**: 1st Sem

### Updated Components
1. `src/store/scholarStore.js`
   - Updated YEAR_LEVELS array (removed SHS Grade 11 & 12)
   - Added SEMESTERS array
   - Exported SEMESTERS constant

2. `src/components/ScholarModal.jsx`
   - Added semester field to form
   - Set default semester to "1st Sem"
   - Updated form layout to 3-column grid (Year Level, Semester, Course)

3. `src/components/ScholarRecords.jsx`
   - Added Semester column to table
   - Added semester filter dropdown
   - Updated filtering logic to include semester
   - Updated colspan from 8 to 9

4. `src/components/Dashboard.jsx`
   - Updated "Year Level Spread" card text from "1st–4th Year & SHS" to "1st–4th Year College"

### Visual Changes
- Table now displays semester for each scholar
- New filter dropdown for semester (All Semesters, 1st Sem, 2nd Sem)
- Form has cleaner 3-column layout for academic info

---

## [1.1.0] - 2026-10-22

### Changed
- **Status Options Updated**: Changed from 4 options to 2 options
  - **Before**: Active, On-Hold, Graduated, Disqualified
  - **After**: Processing, Paid
  
### Status Colors
- **Processing**: Yellow/Amber badge (`bg-amber-100 text-amber-700`)
- **Paid**: Green/Emerald badge (`bg-emerald-100 text-emerald-700`)

### Files Modified
1. `src/components/ScholarModal.jsx`
   - Updated status dropdown options
   - Changed default status to "Processing"

2. `src/components/ScholarRecords.jsx`
   - Updated status filter dropdown
   - Updated status badge colors (getStatusBadge function)

3. `src/store/scholarStore.js`
   - Set default status for new scholars to "Processing"

### Visual Changes
- Yellow badge for "Processing" status
- Green badge for "Paid" status
- Cleaner, more focused status system for scholarship payment tracking

---

## [1.0.0] - 2026-10-22

### Added
- Initial release of Iskolar Scholarship Management System
- Complete React.js application with modern architecture
- Dashboard with analytics
- Scholar records management
- School summary reports
- Year level statistics
- Backup & export functionality
- Auto-save to localStorage
- Responsive design
- Print-ready reports
