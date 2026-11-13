# Supabase Database Requirements

This document lists all database schema changes and function updates required to support the seven major system updates implemented in the front-end application.

## Database Schema Changes

### 1. Add `suffix` Column to `scholars` Table

```sql
-- Add suffix column (optional field)
ALTER TABLE scholars
ADD COLUMN suffix TEXT NULL;

-- Add check constraint for valid suffix values
ALTER TABLE scholars
ADD CONSTRAINT check_suffix_values 
CHECK (suffix IS NULL OR suffix IN ('None', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'));
```

**Purpose**: Store scholar name suffixes (Jr., Sr., II, III, IV, V, or None)  
**Type**: TEXT (nullable)  
**Valid Values**: NULL, 'None', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'

---

### 2. Add `gender` Column to `scholars` Table

```sql
-- Add gender column (required field with default)
ALTER TABLE scholars
ADD COLUMN gender TEXT NOT NULL DEFAULT 'Male';

-- Add check constraint for valid gender values
ALTER TABLE scholars
ADD CONSTRAINT check_gender_values 
CHECK (gender IN ('Male', 'Female'));
```

**Purpose**: Store scholar gender information  
**Type**: TEXT (not null, default 'Male')  
**Valid Values**: 'Male', 'Female'

---

### 3. Update `barangay` Column Constraint

```sql
-- Drop existing barangay constraint if it exists
ALTER TABLE scholars
DROP CONSTRAINT IF EXISTS check_barangay_values;

-- Add updated constraint with 19 barangays + Other
ALTER TABLE scholars
ADD CONSTRAINT check_barangay_values 
CHECK (barangay IN (
  'Atate', 
  'Aulo', 
  'Bagong Buhay', 
  'Caballero', 
  'Caimito', 
  'Doña Josefa', 
  'Ganaderia', 
  'Imelda Valley', 
  'Langka', 
  'Malate', 
  'Maligaya', 
  'Manacnac', 
  'Mapait', 
  'Marcos Village', 
  'Militar', 
  'Popolon', 
  'Santolan', 
  'Sapang Buho', 
  'Singalat', 
  'Other'
));
```

**Purpose**: Enforce valid barangay values (19 specific barangays + Other)  
**Valid Values**: Exact list of 19 barangays plus 'Other' (see above)

---

## Database Functions Updates

### 4. Update `public_dashboard_stats()` Function

The `public_dashboard_stats()` function needs to be updated to include:
- **`male_count`**: Count of scholars with gender = 'Male'
- **`female_count`**: Count of scholars with gender = 'Female'
- **`processing_count`**: Renamed from `unpaid_count`, count of scholars with paymentStatus = 'Processing' or NULL

```sql
CREATE OR REPLACE FUNCTION public_dashboard_stats()
RETURNS TABLE (
  available BOOLEAN,
  total_scholars BIGINT,
  active_scholars BIGINT,
  graduated_scholars BIGINT,
  total_schools BIGINT,
  pwd_count BIGINT,
  solo_parent_count BIGINT,
  male_count BIGINT,
  female_count BIGINT,
  paid_count BIGINT,
  processing_count BIGINT,
  scholars_per_school JSONB,
  scholars_per_year_level JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    true AS available,
    COUNT(*) AS total_scholars,
    COUNT(*) FILTER (WHERE "scholarStatus" = 'Active' OR "scholarStatus" IS NULL) AS active_scholars,
    COUNT(*) FILTER (WHERE "scholarStatus" = 'Graduated') AS graduated_scholars,
    COUNT(DISTINCT school) AS total_schools,
    COUNT(*) FILTER (WHERE is_pwd = true) AS pwd_count,
    COUNT(*) FILTER (WHERE is_solo_parent = true) AS solo_parent_count,
    COUNT(*) FILTER (WHERE gender = 'Male') AS male_count,
    COUNT(*) FILTER (WHERE gender = 'Female') AS female_count,
    COUNT(*) FILTER (WHERE "paymentStatus" = 'Paid') AS paid_count,
    COUNT(*) FILTER (WHERE "paymentStatus" = 'Processing' OR "paymentStatus" IS NULL) AS processing_count,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'school_name', school,
          'count', cnt
        ) ORDER BY cnt DESC
      )
      FROM (
        SELECT school, COUNT(*) AS cnt
        FROM scholars
        GROUP BY school
      ) school_stats
    ) AS scholars_per_school,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'year_level', "yearLevel",
          'count', cnt
        ) ORDER BY "yearLevel"
      )
      FROM (
        SELECT "yearLevel", COUNT(*) AS cnt
        FROM scholars
        GROUP BY "yearLevel"
      ) year_level_stats
    ) AS scholars_per_year_level
  FROM scholars;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Key Changes**:
1. Added `male_count`: `COUNT(*) FILTER (WHERE gender = 'Male')`
2. Added `female_count`: `COUNT(*) FILTER (WHERE gender = 'Female')`
3. Renamed `unpaid_count` to `processing_count`: `COUNT(*) FILTER (WHERE "paymentStatus" = 'Processing' OR "paymentStatus" IS NULL)`

---

## Data Migration Considerations

### Default Values for Existing Records

When adding the new columns to existing data:

1. **`suffix`**: Will be `NULL` for existing scholars (acceptable, means no suffix)
2. **`gender`**: Will default to `'Male'` for existing scholars (can be updated by admin as needed)

### Import Validation Requirements

The import process now requires:

1. **Gender**: Must be present and must be 'Male' or 'Female'
2. **Barangay**: Must match one of the 20 valid values (19 barangays + Other)
3. **GWA**: Must have at least one valid grade entry (cannot be empty)
4. **Suffix**: Optional; if provided, must be valid value

---

## Testing Requirements

After applying these changes, verify:

1. ✅ Can add new scholar with gender 'Male' or 'Female'
2. ✅ Can add new scholar with suffix (Jr., Sr., II, III, IV, V, or None)
3. ✅ Can add new scholar with any of 20 valid barangays
4. ✅ `public_dashboard_stats()` returns `male_count`, `female_count`, and `processing_count`
5. ✅ Import rejects rows without gender or with invalid gender
6. ✅ Import rejects rows with invalid barangay names
7. ✅ Import rejects rows without at least one grade entry with valid GWA
8. ✅ Export includes Suffix and Gender columns
9. ✅ Grades are required (cannot save scholar without at least one grade)
10. ✅ Semester in grades is derived from Academic Information semester (single source of truth)

---

## Summary of Changes

| Change | Type | Required | Impact |
|--------|------|----------|--------|
| Add `suffix` column | Schema | No | Optional field for name suffixes |
| Add `gender` column | Schema | Yes | Required field for gender tracking |
| Update `barangay` constraint | Schema | Yes | Enforce 19 barangays + Other |
| Add `male_count` to dashboard | Function | Yes | Gender statistics on public dashboard |
| Add `female_count` to dashboard | Function | Yes | Gender statistics on public dashboard |
| Rename `unpaid_count` to `processing_count` | Function | Yes | Consistent terminology (Processing not Unpaid) |

---

**Note**: All database changes must be applied before the updated front-end application is deployed to production. The front-end is designed to gracefully handle missing database columns by using default values (`gender='Male'`, `suffix=null`), but full functionality requires all schema and function updates.


---

## Additional Updates - Payment Status and Semester

### 1. Semester - Add 3rd Semester Support

The system now supports trimester schools with three semesters per year.

```sql
-- Update semester check constraint if it exists
ALTER TABLE scholars
DROP CONSTRAINT IF EXISTS check_semester_values;

ALTER TABLE scholars
ADD CONSTRAINT check_semester_values
CHECK (semester IS NULL OR semester IN ('1st Sem', '2nd Sem', '3rd Sem', 'Summer'));
```

**Grade semester values** in the `grades` JSONB array now include:
- `'1st Semester'`
- `'2nd Semester'`
- `'3rd Semester'`  (NEW)
- `'Summer'`

**Purpose**: Support trimester schools that have three terms per academic year.

---

### 2. Payment Status - Read-Only in Edit Form

Payment status is now read-only in the Edit Scholar form and can only be changed through:
1. **Bulk actions**: "Mark as Paid" and "Mark as Unpaid" in the Scholars tab
2. **Advance Term**: When advancing scholars to a new term, payment status can be reset to Processing

**No database changes required**. The existing `status` column (Processing/Paid) continues to work.

**Front-end behavior**:
- Add Scholar form: Automatically sets status to 'Processing'
- Edit Scholar form: Shows current status as read-only badge, not editable
- Bulk actions update status for multiple scholars at once
- Advance Term can optionally reset status to 'Processing' when moving scholars to new term

---

### 3. Advance Term - Batch Updates Per School

The Advance Term feature allows promoting scholars by school at the end of each term/year.

**Required permissions**: Admin must be able to batch-update the following columns on the `scholars` table:
- `year_level` (e.g., '1st Year' → '2nd Year')
- `semester` (e.g., '1st Sem' → '2nd Sem' → '3rd Sem' → '1st Sem' [new year])
- `payment_status` (can be reset to 'Processing' when term changes)
- `status` (changed to 'Graduated' when graduating)
- `year_graduated` (set when graduating)

**No new columns needed**. These are covered by the existing admin RLS policy.

**Behavior**:
- Updates are batched per school (one batch update per school advancement)
- Changes are computed from original values (no cascading)
- Graduated scholars are moved to 'Graduated' status and appear in Graduates tab
- Payment status can optionally be reset to 'Processing' for scholars whose term changes

---

## Summary of New Requirements

| Feature | Database Change | Required |
|---------|----------------|----------|
| 3rd Semester support | Update semester constraint | Yes |
| Payment status read-only | None (UI-only change) | No |
| Advance Term batch updates | Existing admin policy covers it | No |
| Grade semester '3rd Semester' | Accept new value in grades JSONB | Yes |

**Migration Priority**: Only the semester constraint update is required. The rest works with existing schema.
