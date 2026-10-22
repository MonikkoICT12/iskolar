# Sample Data Generator

## Overview

The system includes a **Sample Data Generator** that creates realistic test data for demonstration and testing purposes.

## What It Generates

### 25 Sample Scholars
- **5 scholars per university**
- **5 universities in Nueva Ecija**
- Realistic Filipino names
- Varied scholarship amounts (₱15,000 - ₱50,000)
- Different year levels and semesters
- Random barangays
- Various courses/programs

---

## Universities Included

1. **Nueva Ecija University of Science and Technology (NEUST)** - 5 scholars
2. **Central Luzon State University (CLSU)** - 5 scholars
3. **Wesleyan University - Philippines (WUP)** - 5 scholars
4. **Pampanga State Agricultural University (PSAU) - Nueva Ecija Campus** - 5 scholars
5. **Philippine Normal University (PNU) - Nueva Ecija Extension** - 5 scholars

**Total: 25 scholars**

---

## Scholarship Amount Distribution

Amounts randomly assigned from these values:
- ₱15,000
- ₱20,000
- ₱25,000
- ₱30,000
- ₱35,000
- ₱40,000
- ₱45,000
- ₱50,000

**Range**: ₱15,000 - ₱50,000 per scholar

---

## Sample Scholar Details

### Personal Information
- **Filipino Names**: Authentic Filipino first, middle, and last names
- **LRN**: Auto-generated 12-digit learner reference numbers
- **Barangay**: Random selection from 11 barangays in Palayan City

### Academic Information
- **Year Level**: 1st, 2nd, 3rd, or 4th Year
- **Semester**: 1st Sem or 2nd Sem
- **Courses**: 14 different courses including:
  - BS Computer Science
  - BS Information Technology
  - BS Business Administration
  - BS Accountancy
  - BS Civil Engineering
  - BS Electrical Engineering
  - BS Agriculture
  - BS Education
  - BS Nursing
  - BS Psychology
  - BS Biology
  - AB Communication
  - BS Criminology
  - BS Architecture

### Status Distribution
- **70% Processing** (majority of scholars)
- **30% Paid** (some completed payments)

### Contact Information
- **Phone**: Auto-generated Philippine mobile numbers (09XX XXX XXXX)
- **Email**: Generated from scholar names (firstname.lastname@email.com)

---

## How to Load Sample Data

### Option 1: Using the Button

1. Go to **"Backup & Reports"** tab
2. Find the **"Load Sample Data"** button (purple button)
3. Click the button
4. Confirm the prompt
5. **Done!** 25 scholars added instantly

### Option 2: First-Time Setup

Perfect for:
- Demo presentations
- Testing the system
- Training new users
- Showcasing features

---

## Sample Data Details

### Example Scholar Entry

```javascript
{
  firstName: "Maria",
  lastName: "Santos",
  middleName: "Cruz",
  lrn: "123456789012",
  barangay: "Atate",
  school: "Nueva Ecija University of Science and Technology (NEUST)",
  yearLevel: "2nd Year",
  semester: "1st Sem",
  course: "BS Computer Science",
  amount: 25000,
  status: "Processing",
  contactNumber: "09171234567",
  email: "maria.santos@email.com",
  schoolYear: "2026-2027"
}
```

---

## Use Cases

### 1. Demo & Presentation
**Scenario**: Showing the system to stakeholders

**Steps**:
1. Load sample data
2. Navigate through tabs
3. Show dashboard statistics
4. Demonstrate search and filters
5. Show reports

**Benefits**:
- Instant realistic data
- Professional presentation
- Full feature demonstration

### 2. Training
**Scenario**: Training new staff members

**Steps**:
1. Load sample data
2. Practice searching scholars
3. Learn filtering options
4. Try editing records
5. Generate reports

**Benefits**:
- Safe practice environment
- Realistic scenarios
- No real data at risk

### 3. Testing
**Scenario**: Testing system features

**Steps**:
1. Load sample data
2. Test search functionality
3. Try different filters
4. Export/import data
5. Print reports

**Benefits**:
- Comprehensive test data
- Edge cases included
- Quick reset capability

### 4. Development
**Scenario**: Developing new features

**Steps**:
1. Load sample data
2. Test new features
3. Verify calculations
4. Check visual displays
5. Clear when done

**Benefits**:
- Instant data population
- Varied scenarios
- Easy to reset

---

## Data Statistics

### Overall
- **Total Scholars**: 25
- **Total Universities**: 5
- **Total Amount Range**: ₱375,000 - ₱1,250,000 (varies each time)
- **Average per Scholar**: ₱15,000 - ₱50,000

### Per University
- **Scholars**: 5 each
- **Amount Range**: ₱75,000 - ₱250,000 per university

### Status Distribution
- **Processing**: ~17-18 scholars (70%)
- **Paid**: ~7-8 scholars (30%)

### Year Level Distribution
- **1st Year**: ~6 scholars
- **2nd Year**: ~6 scholars
- **3rd Year**: ~6 scholars
- **4th Year**: ~7 scholars

### Semester Distribution
- **1st Sem**: ~12 scholars
- **2nd Sem**: ~13 scholars

### Barangay Distribution
- Random across 11 barangays
- Each barangay: 2-3 scholars

---

## Technical Details

### File Location
```
src/utils/sampleData.js
```

### Key Functions

**Generate Scholars:**
```javascript
generateSampleScholars()
// Returns array of 25 scholar objects
```

**Load to Store:**
```javascript
handleLoadSampleData()
// Adds scholars to current data
// Shows success notification
```

### Data Generation Logic

1. **Loop through universities** (5)
2. **For each university, create 5 scholars**
3. **Assign random values** for:
   - Name (from 25 Filipino names)
   - LRN (12-digit random)
   - Barangay (from 11 options)
   - Year Level (4 options)
   - Semester (2 options)
   - Course (14 options)
   - Amount (8 options: 15k-50k)
   - Status (70% Processing, 30% Paid)
4. **Generate contact info**
5. **Set school year** (current: 2026-2027)
6. **Add timestamps** (spread over 30 days)

---

## Clearing Sample Data

### Option 1: Clear All Data
1. Go to "Backup & Reports"
2. Click "Clear All Data"
3. Confirm deletion
4. All data removed (including sample data)

### Option 2: Manual Deletion
1. Go to "Scholar Records"
2. Delete scholars one by one
3. Use search to find sample scholars
4. Delete as needed

### Option 3: Export First
1. Export current data as backup
2. Clear all data
3. Import only real data
4. Sample data excluded

---

## Best Practices

### When to Use Sample Data

✅ **Good Uses:**
- Demonstrations
- Training sessions
- Testing features
- Development
- Screenshots
- Presentations

❌ **Avoid:**
- Production use
- Real reporting
- Official records
- Financial tracking
- Audit trails

### Loading Sample Data

**First Time:**
1. Load sample data
2. Explore system
3. Learn features
4. Practice workflows

**Before Demo:**
1. Clear existing data
2. Load sample data
3. Run through demo
4. Show features

**After Demo:**
1. Clear sample data
2. Import real data (if backed up)
3. Or start fresh

---

## Customization

### Modify Sample Data

Edit `src/utils/sampleData.js`:

**Change Universities:**
```javascript
const UNIVERSITIES = [
  'Your University 1',
  'Your University 2',
  // Add more...
]
```

**Change Amount Range:**
```javascript
const amounts = [10000, 20000, 30000, 40000, 50000]
```

**Change Scholar Count:**
```javascript
for (let i = 0; i < 10; i++) { // Change 5 to 10 for 10 per university
```

**Change Names:**
```javascript
const FILIPINO_NAMES = [
  { firstName: 'Your', lastName: 'Name', middleName: 'Middle' },
  // Add more...
]
```

---

## Verification

### Check Sample Data Loaded

1. **Dashboard**: See total increase to 25+
2. **Scholar Records**: See all 25 scholars
3. **School Summary**: See 5 universities
4. **Year Level Stats**: See distribution

### Verify Amounts

1. Go to Dashboard
2. Check "Total Amount Allocated"
3. Should increase by ₱375,000 - ₱1,250,000
4. Varies due to random amounts

### Verify Universities

1. Go to "Summary per School"
2. Should see 5 universities
3. Each with 5 scholars
4. Each with total amounts

---

## Troubleshooting

### Issue: Button not visible
**Solution**: Go to "Backup & Reports" tab

### Issue: No data loaded
**Solution**: 
1. Check browser console for errors
2. Refresh page and try again
3. Check localStorage permissions

### Issue: Duplicate data
**Solution**: 
1. Sample data adds to existing
2. If duplicates appear, clear all data first
3. Then load sample data

### Issue: Wrong amounts
**Solution**: 
1. Amounts are random (15k-50k)
2. This is expected behavior
3. Each scholar gets different amount

---

## Future Enhancements

Possible additions:
- [ ] Custom sample size (10, 25, 50, 100 scholars)
- [ ] Specific university selection
- [ ] Custom amount ranges
- [ ] Import from CSV/Excel
- [ ] Realistic grade distributions
- [ ] Historical data (multiple years)
- [ ] Bulk status updates

---

## Summary

**Quick Facts:**
- ✅ 25 scholars total
- ✅ 5 universities
- ✅ 5 scholars per university
- ✅ ₱15,000 - ₱50,000 per scholar
- ✅ Realistic Filipino data
- ✅ One-click loading
- ✅ Perfect for demos and testing

**Loading Time:** Instant! ⚡

**Perfect for:** Testing, training, and demonstrations! 🎯
