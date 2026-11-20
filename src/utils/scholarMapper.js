/**
 * Schema-adaptive mapper between Supabase `public.scholars` / `public.scholar_grades` rows
 * and the application's normalized scholar model.
 */

export const DEFAULT_DB_SCHEMA = {
  columns: null,
  firstName: 'first_name',
  middleName: 'middle_name',
  lastName: 'last_name',
  suffix: 'suffix',
  gender: 'gender',
  barangay: 'barangay',
  school: 'school',
  course: 'course',
  yearLevel: 'year_level',
  semester: 'semester',
  schoolYear: 'school_year',
  scholarshipAmount: 'scholarship_amount',
  amount: 'amount',
  paymentStatus: 'payment_status',
  status: 'status',
  scholarStatus: 'scholar_status',
  yearGraduated: 'year_graduated',
  isPwd: 'is_pwd',
  isSoloParent: 'is_solo_parent',
  contactNumber: 'contact_number',
  email: 'email',
  grades: 'grades',
  remarks: 'remarks',
  schoolId: null,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  statusHoldsScholarState: false,
}

const SCHOLAR_STATE_VALUES = new Set(['Active', 'Graduated', 'Inactive', 'Suspended'])

/**
 * Inspect fetched DB rows to detect exact column casing and semantics.
 */
export function detectDbSchema(rows) {
  if (!rows || rows.length === 0) {
    return { ...DEFAULT_DB_SCHEMA }
  }

  const columns = new Set(Object.keys(rows[0]))

  const pick = (...candidates) => candidates.find((col) => columns.has(col)) ?? null

  const scholarshipAmount =
    pick('scholarship_amount', 'scholarshipAmount', 'amount')

  const statusHoldsScholarState = Boolean(
    columns.has('status') &&
      rows.some((r) => SCHOLAR_STATE_VALUES.has(r.status))
  )

  return {
    columns,
    firstName: pick('firstName', 'first_name') ?? 'first_name',
    middleName: pick('middleName', 'middle_name'),
    lastName: pick('lastName', 'last_name') ?? 'last_name',
    suffix: pick('suffix'),
    gender: pick('gender'),
    barangay: pick('barangay'),
    school: pick('school'),
    course: pick('course'),
    yearLevel: pick('yearLevel', 'year_level') ?? 'year_level',
    semester: pick('semester'),
    schoolYear: pick('schoolYear', 'school_year'),
    scholarshipAmount,
    amount: pick('amount'),
    paymentStatus: pick('paymentStatus', 'payment_status'),
    status: pick('status'),
    scholarStatus: pick('scholarStatus', 'scholar_status'),
    yearGraduated: pick('yearGraduated', 'year_graduated'),
    isPwd: pick('is_pwd', 'isPwd'),
    isSoloParent: pick('is_solo_parent', 'isSoloParent'),
    contactNumber: pick('contactNumber', 'contact_number'),
    email: pick('email'),
    grades: pick('grades'),
    remarks: pick('remarks'),
    schoolId: pick('school_id', 'schoolId'),
    createdAt: pick('createdAt', 'created_at'),
    updatedAt: pick('updatedAt', 'updated_at'),
    statusHoldsScholarState,
  }
}

/**
 * Normalize a single grade object from JSONB or `scholar_grades`.
 */
export function normalizeGradeEntry(entry) {
  if (!entry || typeof entry !== 'object') return null
  const gwa = Number(entry.gwa)
  if (!Number.isFinite(gwa)) return null

  return {
    schoolYear: String(entry.schoolYear ?? entry.school_year ?? ''),
    semester: String(entry.semester ?? ''),
    gwa,
    createdAt: entry.createdAt ?? entry.created_at ?? '',
  }
}

/**
 * Convert a raw Supabase scholar row (plus optional fallback grade rows)
 * into the canonical frontend scholar object.
 */
export function normalizeScholarRow(row, fallbackGrades = []) {
  let rawGrades = row.grades
  if (typeof rawGrades === 'string') {
    try {
      rawGrades = JSON.parse(rawGrades)
    } catch {
      rawGrades = []
    }
  }

  const gradeSource =
    Array.isArray(rawGrades) && rawGrades.length > 0
      ? rawGrades
      : Array.isArray(fallbackGrades)
      ? fallbackGrades
      : []

  const grades = gradeSource.map(normalizeGradeEntry).filter(Boolean)

  const rawAmount =
    Number(row.scholarship_amount ?? row.scholarshipAmount ?? row.amount ?? 0) || 0

  const scholarStatus =
    row.scholarStatus ??
    row.scholar_status ??
    (row.status === 'Active' || row.status === 'Graduated' ? row.status : 'Active')

  const rawPaymentStatus =
    row.paymentStatus ??
    row.payment_status ??
    (row.status === 'Paid' || row.status === 'Processing' ? row.status : null) ??
    'Processing'

  const createdAt = row.createdAt ?? row.created_at ?? new Date().toISOString()
  const updatedAt = row.updatedAt ?? row.updated_at ?? createdAt

  return {
    id: row.id,
    schoolId: row.school_id ?? row.schoolId ?? null,
    firstName: row.firstName ?? row.first_name ?? '',
    middleName: row.middleName ?? row.middle_name ?? '',
    lastName: row.lastName ?? row.last_name ?? '',
    suffix: row.suffix || 'None',
    gender: row.gender || 'Male',
    barangay: row.barangay || 'Atate',
    school: row.school || '',
    course: row.course || '',
    yearLevel: row.yearLevel ?? row.year_level ?? '1st Year',
    semester: row.semester || '1st Sem',
    schoolYear: row.schoolYear ?? row.school_year ?? '2026-2027',
    scholarship_amount: rawAmount,
    amount: rawAmount,
    status: rawPaymentStatus,
    paymentStatus: rawPaymentStatus,
    scholarStatus,
    yearGraduated: row.yearGraduated ?? row.year_graduated ?? null,
    is_pwd: Boolean(row.is_pwd ?? row.isPwd ?? false),
    is_solo_parent: Boolean(row.is_solo_parent ?? row.isSoloParent ?? false),
    contactNumber: row.contactNumber ?? row.contact_number ?? '',
    email: row.email ?? '',
    grades,
    remarks: row.remarks ?? '',
    createdAt,
    updatedAt,
  }
}

/**
 * Convert partial or full app scholar input into a Supabase column payload
 * constrained to columns known to exist in `dbSchema`.
 */
export function toDbPayload(
  scholarInput,
  dbSchema = DEFAULT_DB_SCHEMA,
  { isInsert = false } = {}
) {
  const schema = dbSchema || DEFAULT_DB_SCHEMA
  const payload = {}

  const setCol = (colName, val) => {
    if (!colName) return
    if (!schema.columns || schema.columns.has(colName)) {
      payload[colName] = val
    }
  }

  if (scholarInput.firstName !== undefined) {
    setCol(schema.firstName, scholarInput.firstName)
  }
  if (scholarInput.middleName !== undefined) {
    setCol(schema.middleName, scholarInput.middleName || null)
  }
  if (scholarInput.lastName !== undefined) {
    setCol(schema.lastName, scholarInput.lastName)
  }
  if (scholarInput.suffix !== undefined) {
    const suffixVal =
      scholarInput.suffix === 'None' || scholarInput.suffix === ''
        ? null
        : scholarInput.suffix
    setCol(schema.suffix, suffixVal)
  }
  if (scholarInput.gender !== undefined) {
    setCol(schema.gender, scholarInput.gender)
  }
  if (scholarInput.barangay !== undefined) {
    setCol(schema.barangay, scholarInput.barangay)
  }
  if (scholarInput.school !== undefined) {
    setCol(schema.school, scholarInput.school)
  }
  if (scholarInput.course !== undefined) {
    setCol(schema.course, scholarInput.course || null)
  }
  if (scholarInput.yearLevel !== undefined) {
    setCol(schema.yearLevel, scholarInput.yearLevel)
  }
  if (scholarInput.semester !== undefined) {
    setCol(schema.semester, scholarInput.semester)
  }
  if (scholarInput.schoolYear !== undefined) {
    setCol(schema.schoolYear, scholarInput.schoolYear)
  }
  if (scholarInput.is_pwd !== undefined) {
    setCol(schema.isPwd, Boolean(scholarInput.is_pwd))
  }
  if (scholarInput.is_solo_parent !== undefined) {
    setCol(schema.isSoloParent, Boolean(scholarInput.is_solo_parent))
  }
  if (scholarInput.contactNumber !== undefined) {
    setCol(schema.contactNumber, scholarInput.contactNumber || null)
  }
  if (scholarInput.email !== undefined) {
    setCol(schema.email, scholarInput.email || null)
  }
  if (scholarInput.grades !== undefined) {
    setCol(schema.grades, scholarInput.grades || [])
  }
  if (scholarInput.remarks !== undefined) {
    setCol(schema.remarks, scholarInput.remarks || null)
  }
  if (scholarInput.yearGraduated !== undefined) {
    setCol(schema.yearGraduated, scholarInput.yearGraduated)
  }

  // Sync scholarship_amount / amount
  if (
    scholarInput.scholarship_amount !== undefined ||
    scholarInput.amount !== undefined
  ) {
    const raw = scholarInput.scholarship_amount ?? scholarInput.amount
    const numAmount = parseFloat(raw) || 0
    setCol(schema.scholarshipAmount, numAmount)
    if (schema.amount && schema.amount !== schema.scholarshipAmount) {
      setCol(schema.amount, numAmount)
    }
  }

  // Sync payment status (`status` in frontend & `payment_status` / `paymentStatus` in DB)
  if (
    scholarInput.status !== undefined ||
    scholarInput.paymentStatus !== undefined
  ) {
    const payVal = scholarInput.status ?? scholarInput.paymentStatus
    setCol(schema.paymentStatus, payVal)
    if (schema.status && !schema.statusHoldsScholarState) {
      setCol(schema.status, payVal)
    }
  }

  // Sync scholar status (`Active` / `Graduated`)
  if (scholarInput.scholarStatus !== undefined) {
    setCol(schema.scholarStatus, scholarInput.scholarStatus)
    if (schema.status && schema.statusHoldsScholarState) {
      setCol(schema.status, scholarInput.scholarStatus)
    }
  }

  // Generate school_id on insert only if column is detected in live schema
  if (
    isInsert &&
    schema.schoolId &&
    schema.columns &&
    schema.columns.has(schema.schoolId)
  ) {
    const generatedId =
      scholarInput.schoolId ||
      'ADM-' + crypto.randomUUID().slice(0, 8).toUpperCase()
    setCol(schema.schoolId, generatedId)
  }

  return payload
}
