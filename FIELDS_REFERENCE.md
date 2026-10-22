# Scholar Fields Reference

## Complete Field List

### Personal Information
| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| First Name | Text | ✅ Yes | - | Scholar's first name |
| Last Name | Text | ✅ Yes | - | Scholar's last name |
| Middle Name | Text | ❌ No | - | Scholar's middle name |
| LRN | Text | ❌ No | - | 12-digit Learner Reference Number |
| Barangay | Dropdown | ✅ Yes | Atate | 12 barangay options + Other |

### Academic Information
| Field | Type | Required | Default | Options | Notes |
|-------|------|----------|---------|---------|-------|
| School/University | Text | ✅ Yes | - | - | Full school name |
| Year Level | Dropdown | ✅ Yes | 1st Year | 1st, 2nd, 3rd, 4th Year | College only |
| Semester | Dropdown | ✅ Yes | 1st Sem | 1st Sem, 2nd Sem | Academic semester |
| Course/Program | Text | ❌ No | - | - | e.g., BS Computer Science |

### Scholarship Details
| Field | Type | Required | Default | Options | Notes |
|-------|------|----------|---------|---------|-------|
| Amount | Number | ✅ Yes | - | Min: 0 | Scholarship amount in PHP |
| Status | Dropdown | ✅ Yes | Processing | Processing, Paid | Payment status |

### Contact Information (Optional)
| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| Contact Number | Text | ❌ No | - | e.g., 09XX XXX XXXX |
| Email | Email | ❌ No | - | e.g., scholar@example.com |

### System Fields (Auto-generated)
| Field | Type | Notes |
|-------|------|-------|
| ID | String | Unique identifier (timestamp-based) |
| School Year | String | Automatically set from system settings |
| Created At | Date | ISO timestamp when record was created |

## Field Details

### Barangay Options
```
1. Atate (default)
2. Caballero
3. Caimito
4. Ganaderia
5. Langka
6. Mapangpang
7. Marcos Village
8. Malabo
9. Popolon
10. Singalat
11. Poblacion
12. Other
```

### Year Level Options (College Only)
```
1. 1st Year (default)
2. 2nd Year
3. 3rd Year
4. 4th Year
```

**Note**: SHS Grade 11 and Grade 12 removed as of v1.2.0

### Semester Options
```
1. 1st Sem (default)
2. 2nd Sem
```

### Status Options
```
1. Processing (default) - Yellow badge
2. Paid - Green badge
```

## Form Layout

### Scholar Modal Form Structure

```
┌─────────────────────────────────────────────────────┐
│  PERSONAL INFORMATION                               │
├─────────────────────────────────────────────────────┤
│  [First Name]  [Last Name]  [Middle Name]          │
│  [LRN]                      [Barangay ▼]           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ACADEMIC INFORMATION                               │
├─────────────────────────────────────────────────────┤
│  [School / University - Full Width]                │
│  [Year Level ▼]  [Semester ▼]  [Course/Program]   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  SCHOLARSHIP DETAILS                                │
├─────────────────────────────────────────────────────┤
│  [Amount (₱)]              [Status ▼]              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  CONTACT INFORMATION (OPTIONAL)                     │
├─────────────────────────────────────────────────────┤
│  [Contact Number]          [Email Address]         │
└─────────────────────────────────────────────────────┘
```

## Table Display

### Scholar Records Table Columns

```
| Scholar Name/LRN | Barangay | School | Year | Sem | Course | Amount | Status | Actions |
|------------------|----------|--------|------|-----|--------|--------|--------|---------|
```

**Total Columns**: 9

## Filter Options

### Available Filters in Scholar Records

1. **Search Bar**: Text search across name, LRN, course, school, barangay
2. **Barangay Filter**: All Barangays + 12 specific options
3. **School Filter**: All Schools + dynamic list from records
4. **Year Level Filter**: All Year Levels + 4 college years
5. **Semester Filter**: All Semesters + 1st Sem + 2nd Sem
6. **Status Filter**: All Status + Processing + Paid

## Data Model

```javascript
Scholar Object Structure:
{
  // Auto-generated
  id: "1729582740123",
  createdAt: "2026-10-22T10:30:00.000Z",
  schoolYear: "2026-2027",
  
  // Personal Info
  firstName: "Juan",
  lastName: "Dela Cruz",
  middleName: "Santos",
  lrn: "123456789012",
  barangay: "Atate",
  
  // Academic Info
  school: "Nueva Ecija University of Science and Technology",
  yearLevel: "1st Year",
  semester: "1st Sem",
  course: "BS Computer Science",
  
  // Scholarship Details
  amount: 25000,
  status: "Processing",
  
  // Contact Info (optional)
  contactNumber: "09171234567",
  email: "juan.delacruz@email.com"
}
```

## Validation Rules

### Required Fields
- First Name (text, not empty)
- Last Name (text, not empty)
- Barangay (must select from dropdown)
- School/University (text, not empty)
- Year Level (must select from dropdown)
- Semester (must select from dropdown)
- Amount (number, min: 0)
- Status (must select from dropdown)

### Optional Fields
- Middle Name
- LRN
- Course/Program
- Contact Number
- Email

### Format Requirements
- Amount: Must be a valid number (accepts decimals)
- Email: Must be valid email format (validated by HTML5)
- LRN: Suggested 12 digits (not enforced)

## Default Values

When creating a new scholar:
```javascript
{
  barangay: "Atate",
  yearLevel: "1st Year",
  semester: "1st Sem",
  status: "Processing",
  schoolYear: [Current School Year from system]
}
```

## Search Functionality

### Searchable Fields
The search bar searches across:
- First Name
- Last Name
- Middle Name
- LRN
- Course/Program
- School/University
- Barangay

### Search Behavior
- Case-insensitive
- Partial matching
- Real-time (updates as you type)
- Works with filters (AND logic)

## Best Practices

### Data Entry
1. **School Name**: Use full official name
2. **Course**: Use standard abbreviations (BS, BA, etc.)
3. **Amount**: Enter without peso sign or comma
4. **LRN**: Enter 12-digit number without spaces
5. **Contact**: Use format 09XX XXX XXXX

### Data Management
1. Always verify scholar info before saving
2. Set status to "Processing" for new applications
3. Update to "Paid" only after payment confirmation
4. Use semester field to track current enrollment
5. Export backup regularly (at least weekly)

---

**Last Updated**: Version 1.2.0 - October 22, 2026
