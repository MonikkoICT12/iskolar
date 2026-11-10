# Testing Guide - Scholarship Amount Field

## Overview
This update adds a required "Scholarship Amount" field to all scholars with formatted input (thousands separators) and proper display throughout the system.

## Changes Made

### 1. Data Model (src/store/scholarStore.js)
- Added `scholarship_amount` field (numeric, default 0)
- Updated `addScholar()` to initialize scholarship_amount
- Updated all amount calculations to use scholarship_amount with fallback to old amount field
- Backward compatible: existing records without scholarship_amount are treated as 0

### 2. Scholar Forms (src/components/ScholarModal.jsx)
- Added "Scholarship Amount (PHP)" field with formatted input
- Real-time formatting: displays thousands separators as user types (e.g., 25,000)
- Input validation:
  - Only accepts numbers and decimal point
  - No negative numbers
  - Required field (must be > 0)
  - Shows inline error message if empty or invalid
- Stored as plain number in database (e.g., 25000.00)

### 3. Display Components
Updated all components to display scholarship_amount:
- **ScholarRecords.jsx**: Table displays formatted amounts (PHP 25,000.00)
- **Dashboard.jsx**: Recent scholars table shows formatted amounts
- **SchoolSummary.jsx**: School details modal shows formatted amounts
- All totals and calculations use scholarship_amount

### 4. Import/Export (BackupReports.jsx)
- Export: includes scholarship_amount field in JSON
- Import: accepts optional "Scholarship Amount" column
- Backward compatible: imports without scholarship_amount default to 0

### 5. Database Documentation (docs/supabase-requirements.md)
- Added scholarship_amount column specification:
  - Type: NUMERIC
  - NOT NULL
  - DEFAULT 0
- Updated notes for backend developer

## Testing Checklist

### A. Add New Scholar
1. Click "Add Scholar" button
2. Fill in all required fields
3. In "Scholarship Amount (PHP)" field:
   - Type: `25000`
   - Verify it displays as: `25,000`
   - Try typing: `25000.50`
   - Verify it displays as: `25,000.50`
4. Try leaving field empty → Should show error: "Scholarship amount is required and must be greater than 0"
5. Try typing: `0` → Should show error
6. Fill valid amount and submit
7. Verify scholar is added successfully

### B. Edit Existing Scholar
1. Click Edit button on any scholar
2. Verify scholarship amount field shows current amount (or 0 if legacy data)
3. Update amount to: `30000`
4. Verify it formats to: `30,000`
5. Save and verify update successful

### C. Display Verification
1. **Scholar Records Tab**:
   - Verify "Amount" column shows formatted amounts (PHP X,XXX.XX)
   - Verify footer total calculates correctly
   
2. **Dashboard Tab**:
   - Verify "Recent Scholars" shows formatted amounts
   - Verify summary cards show correct totals
   
3. **School Summary Tab**:
   - Click "View Scholars" on any school
   - Verify amounts are formatted correctly
   - Verify totals match

### D. Import/Export
1. **Export**:
   - Click "Export / Backup JSON"
   - Open downloaded file
   - Verify `scholarship_amount` field exists for each scholar
   
2. **Import**:
   - Import the exported JSON
   - Verify all amounts preserved correctly
   - Try importing old JSON without scholarship_amount
   - Verify system doesn't crash (defaults to 0)

### E. Backward Compatibility
1. If you have old data (before this update):
   - Verify old scholars display `PHP 0.00` in amount column
   - Edit an old scholar
   - Add scholarship amount
   - Verify it saves and displays correctly

### F. Validation Testing
1. Try submitting form with empty scholarship amount → Should show error
2. Try typing letters in amount field → Should be filtered out (only numbers allowed)
3. Try typing multiple decimal points → Should be prevented
4. Try very large number (e.g., 1000000) → Should format as 1,000,000

## Expected Behavior

### Formatting Rules
- **Input**: As you type, numbers are automatically formatted with commas
- **Display**: All amounts shown as "PHP X,XXX.XX" (two decimal places)
- **Storage**: Plain numeric value (no commas, no currency symbol)
- **Validation**: Must be > 0, cannot be empty

### Calculations
All totals now use `scholarship_amount || amount || 0`:
- Dashboard summary cards
- School statistics
- Year level statistics
- Filtered totals in Scholar Records

### Graduated Scholars
- Public landing page shows total scholarship amounts per school (sum of graduated scholars' scholarship_amount)
- Admin Graduates tab shows full details including amounts

## Build Status
✅ Build succeeds with **0 errors, 0 warnings**

## Files Modified
1. `src/store/scholarStore.js` - Data model and calculations
2. `src/components/ScholarModal.jsx` - Form with formatted input
3. `src/components/ScholarRecords.jsx` - Table display
4. `src/components/Dashboard.jsx` - Dashboard display
5. `src/components/SchoolSummary.jsx` - School details display
6. `docs/supabase-requirements.md` - Database specifications

## Next Steps
- Backend developer should add `scholarship_amount` column to Supabase scholars table
- Column spec: `scholarship_amount NUMERIC NOT NULL DEFAULT 0`
- Run migration to add column to existing table
- All existing records will default to 0 (can be updated through admin interface)
