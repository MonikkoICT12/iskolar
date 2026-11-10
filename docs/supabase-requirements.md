# Supabase Backend Requirements

This document specifies the database structure, RPC functions, and access rules required by the front-end application.

## Environment Variables

The front-end uses the following environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key (public key)

**IMPORTANT:** Never use or expose the service role key in the front-end code.

---

## Database Schema

### Table: `scholars`

The main table storing all scholar information.

#### Columns:

| Column Name | Data Type | Required | Description |
|-------------|-----------|----------|-------------|
| `id` | UUID | Yes | Primary key, auto-generated |
| `firstName` | TEXT | Yes | Scholar's first name |
| `lastName` | TEXT | Yes | Scholar's last name |
| `school` | TEXT | Yes | Name of the university/school |
| `course` | TEXT | No | Academic program/course |
| `yearLevel` | TEXT | No | Year level (e.g., "1st Year", "2nd Year") |
| `scholarStatus` | TEXT | Yes | Status: "Active" or "Graduated" |
| `yearGraduated` | TEXT | No | Year of graduation (required if scholarStatus is "Graduated") |
| `scholarship_amount` | NUMERIC | Yes (default 0) | Total scholarship amount received (in PHP, not null, default 0) |
| `status` | TEXT | No | Payment status: "Paid" or "Processing" |
| `contact` | TEXT | No | Contact information |
| `address` | TEXT | No | Home address |
| `schoolYear` | TEXT | No | School year (e.g., "2025-2026") |
| `created_at` | TIMESTAMP | Yes | Record creation timestamp (auto-generated) |
| `updated_at` | TIMESTAMP | Yes | Last update timestamp (auto-updated) |

#### Notes:
- `scholarStatus` must be either "Active" or "Graduated"
- When `scholarStatus` is "Graduated", `yearGraduated` should be populated
- `scholarship_amount` stores the total scholarship money in PHP currency (NUMERIC, NOT NULL, DEFAULT 0)
- Existing records without scholarship_amount are treated as 0 until edited by admin

---

## RPC Functions (Public Endpoints)

These functions must be callable using the **anonymous key** (public access). They return aggregate data only, with no personal information.

### 1. `public_dashboard_stats()`

**Purpose:** Returns aggregate statistics for the public dashboard.

**Parameters:** None

**Returns:** JSON object with the following fields:

```json
{
  "total_scholars": 150,
  "active_scholars": 120,
  "graduated_scholars": 30,
  "total_schools": 8,
  "scholars_per_school": [
    {
      "school_name": "Nueva Ecija University of Science and Technology",
      "count": 45
    },
    {
      "school_name": "Central Luzon State University",
      "count": 38
    }
  ],
  "scholars_per_year_level": [
    {
      "year_level": "1st Year",
      "count": 35
    },
    {
      "year_level": "2nd Year",
      "count": 30
    },
    {
      "year_level": "3rd Year",
      "count": 28
    },
    {
      "year_level": "4th Year",
      "count": 27
    }
  ],
  "paid_count": 100,
  "unpaid_count": 20
}
```

**Implementation Notes:**
- Count only scholars with `scholarStatus = 'Active'` for active_scholars
- Count only scholars with `scholarStatus = 'Graduated'` for graduated_scholars
- `scholars_per_school` should include all schools, sorted by count (descending)
- `scholars_per_year_level` should count active scholars only
- `paid_count`: scholars with `status = 'Paid'`
- `unpaid_count`: scholars with `status = 'Processing'`

---

### 2. `public_graduates_by_school()`

**Purpose:** Returns aggregate graduate data grouped by school.

**Parameters:** None

**Returns:** JSON array of objects:

```json
[
  {
    "school_name": "Nueva Ecija University of Science and Technology",
    "graduate_count": 25,
    "total_scholarship_amount": 1250000.00
  },
  {
    "school_name": "Central Luzon State University",
    "graduate_count": 18,
    "total_scholarship_amount": 900000.00
  }
]
```

**Implementation Notes:**
- Include only scholars with `scholarStatus = 'Graduated'`
- Group by `school` field
- `total_scholarship_amount` is the SUM of `scholarship_amount` for all graduated scholars in that school
- Sort alphabetically by school name
- Return empty array `[]` if no graduates exist

---

## Row Level Security (RLS) Policies

### Scholars Table

**Public Access (Anonymous Key):**
- **NO direct access** to the `scholars` table
- Public users can ONLY call the two RPC functions above

**Admin Access (Authenticated Users):**
- **Full CRUD access** to all rows in the `scholars` table
- Admins can SELECT, INSERT, UPDATE, DELETE

#### Sample RLS Policies:

```sql
-- Public: No direct access to scholars table
-- (RPC functions are public but the table is not)

-- Admin: Full access for authenticated users
CREATE POLICY "Admins can do everything"
ON scholars
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

---

## Authentication

### Admin Account

- Use **Supabase Auth** with email/password
- Admin account(s) must be created through Supabase Dashboard or Auth API
- The front-end does NOT create admin accounts automatically
- Sample admin email: `admin@palayancity.gov.ph` (or your choice)

### Sign In Flow

1. User enters email and password on `/signin` page
2. Front-end calls `supabase.auth.signInWithPassword({ email, password })`
3. On success, user is redirected to `/admin` routes
4. Protected routes require valid JWT token from Supabase Auth

---

## Testing Checklist

### Public Endpoints (No Authentication Required)
- [ ] Call `public_dashboard_stats()` with anon key - returns aggregate statistics
- [ ] Call `public_graduates_by_school()` with anon key - returns graduate totals per school
- [ ] Verify RPC functions do NOT expose personal information (names, contact, address)

### Admin Access (Authentication Required)
- [ ] Create admin user in Supabase Auth
- [ ] Sign in with admin credentials
- [ ] Verify authenticated user can read all scholars
- [ ] Verify authenticated user can create/update/delete scholars

### Security
- [ ] Anonymous users CANNOT directly query `scholars` table
- [ ] Anonymous users can ONLY call the two public RPC functions
- [ ] Admin users require valid authentication token
- [ ] RLS policies are enabled and tested

---

## Example SQL Implementation

Here's a sample implementation for the RPC functions:

```sql
-- Function: public_dashboard_stats
CREATE OR REPLACE FUNCTION public_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_scholars', (SELECT COUNT(*) FROM scholars),
    'active_scholars', (SELECT COUNT(*) FROM scholars WHERE "scholarStatus" = 'Active'),
    'graduated_scholars', (SELECT COUNT(*) FROM scholars WHERE "scholarStatus" = 'Graduated'),
    'total_schools', (SELECT COUNT(DISTINCT school) FROM scholars),
    'scholars_per_school', (
      SELECT json_agg(json_build_object('school_name', school, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT school, COUNT(*) as cnt
        FROM scholars
        GROUP BY school
      ) schools
    ),
    'scholars_per_year_level', (
      SELECT json_agg(json_build_object('year_level', "yearLevel", 'count', cnt))
      FROM (
        SELECT "yearLevel", COUNT(*) as cnt
        FROM scholars
        WHERE "scholarStatus" = 'Active' AND "yearLevel" IS NOT NULL
        GROUP BY "yearLevel"
        ORDER BY "yearLevel"
      ) year_levels
    ),
    'paid_count', (SELECT COUNT(*) FROM scholars WHERE status = 'Paid'),
    'unpaid_count', (SELECT COUNT(*) FROM scholars WHERE status = 'Processing')
  )
  INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public_dashboard_stats() TO anon;

-- Function: public_graduates_by_school
CREATE OR REPLACE FUNCTION public_graduates_by_school()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'school_name', school,
      'graduate_count', graduate_count,
      'total_scholarship_amount', total_amount
    ) ORDER BY school ASC
  )
  INTO result
  FROM (
    SELECT 
      school,
      COUNT(*) as graduate_count,
      COALESCE(SUM(scholarship_amount), 0) as total_amount
    FROM scholars
    WHERE "scholarStatus" = 'Graduated'
    GROUP BY school
  ) graduates;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public_graduates_by_school() TO anon;
```

---

## Front-End Behavior

### Landing Page (Public)
- Calls both RPC functions on page load
- Shows "Data is not available yet" if functions don't exist or return errors
- Displays ONLY aggregate data (no personal information)
- Does NOT require authentication

### Admin Pages (Protected)
- Requires Supabase Auth login
- Direct access to `scholars` table for full CRUD operations
- Shows all personal details (names, contact, address, etc.)
- Logout button signs out and returns to landing page

---

## Questions or Issues?

If you have questions about the requirements, please refer to:
- The front-end codebase at `src/services/dataService.js`
- The landing page component at `src/components/LandingPage.jsx`
- Supabase documentation: https://supabase.com/docs
