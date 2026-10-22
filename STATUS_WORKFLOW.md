# Status Workflow & Permissions

## Automatic Status Assignment

### New Scholar Status
When adding a new scholar, the status is **automatically set to "Processing"**.

**Key Points:**
- ✅ No status selection needed when adding scholar
- ✅ Always starts as "Processing"
- ✅ Simplifies data entry
- ✅ Consistent workflow

### Why Auto-Processing?

1. **Consistency**: All new scholars start in same status
2. **Simplicity**: One less field to fill during entry
3. **Accuracy**: No accidental "Paid" status for new scholars
4. **Workflow**: Matches real-world process (apply → process → pay)

---

## Status Change Permissions

### Who Can Change Status?

| Role | Add Scholar | Change Status |
|------|-------------|---------------|
| **Admin** | ✅ Yes | ✅ Yes (Processing → Paid) |
| **Staff** | ✅ Yes | ❌ No (View only) |

### Admin Privileges
- **Can**: Change status from "Processing" to "Paid"
- **When**: After scholarship payment is released
- **How**: Edit scholar → Change status dropdown → Save

### Staff Limitations
- **Can**: Add new scholars (auto-set to Processing)
- **Cannot**: Change status (no dropdown shown)
- **View**: Can see current status in table

---

## Form Behavior

### When Adding New Scholar

**What You See:**
```
┌─────────────────────────────────────┐
│ SCHOLARSHIP DETAILS                 │
├─────────────────────────────────────┤
│ Scholarship Amount (₱) *            │
│ [Enter amount field - full width]  │
│                                     │
│ ℹ️ Note: New scholars are           │
│ automatically set to "Processing"   │
│ status. Admins can change this to   │
│ "Paid" after payment is released.   │
└─────────────────────────────────────┘
```

**What Happens:**
1. Amount field takes full width
2. No status dropdown visible
3. Informational note explains auto-status
4. Status set to "Processing" on save

### When Editing Scholar (Admin)

**What You See:**
```
┌─────────────────────────────────────┐
│ SCHOLARSHIP DETAILS                 │
├─────────────────────────────────────┤
│ Scholarship Amount (₱) * | Status * │
│ [Amount field]          | [Dropdown]│
│                         | Processing │
│                         | Paid      │
│                         |           │
│                         | ℹ️ Only    │
│                         | admins can│
│                         | change... │
└─────────────────────────────────────┘
```

**What Happens:**
1. Amount field takes left half
2. Status dropdown on right half
3. Can change between Processing/Paid
4. Helper text shows it's admin-only

### When Editing Scholar (Staff)

**What You See:**
```
┌─────────────────────────────────────┐
│ SCHOLARSHIP DETAILS                 │
├─────────────────────────────────────┤
│ Scholarship Amount (₱) *            │
│ [Enter amount field - full width]  │
│                                     │
│ Current Status: Processing          │
│ (Contact admin to change status)    │
└─────────────────────────────────────┘
```

**What Happens:**
1. Amount field takes full width
2. No status dropdown (read-only)
3. Current status shown as text
4. Note to contact admin for changes

---

## Status Workflow Diagram

```
┌─────────────────────────────────────────────┐
│ SCHOLAR LIFECYCLE                           │
└─────────────────────────────────────────────┘

1. ENTRY
   │
   ├─► Staff/Admin adds new scholar
   │   └─► Status: Processing (automatic)
   │
2. REVIEW
   │
   ├─► Admin reviews application
   │   └─► Status: Still Processing
   │
3. APPROVAL & PAYMENT
   │
   ├─► Admin approves and releases payment
   │   └─► Admin changes status to "Paid"
   │
4. COMPLETE
   │
   └─► Status: Paid (final)

```

---

## Visual Status Indicators

### In Table View

**Processing Status:**
```
┌──────────────┐
│ Processing   │ ← Yellow/Amber badge
└──────────────┘
```

**Paid Status:**
```
┌──────────────┐
│ Paid         │ ← Green/Emerald badge
└──────────────┘
```

### Color Coding

| Status | Badge Color | Background | Text Color |
|--------|-------------|------------|------------|
| Processing | Yellow/Amber | `bg-amber-100` | `text-amber-700` |
| Paid | Green/Emerald | `bg-emerald-100` | `text-emerald-700` |

---

## Use Cases

### Use Case 1: Adding New Scholar (Staff)

**Steps:**
1. Staff clicks "Add Scholar"
2. Fills in all required information
3. Enters scholarship amount
4. Sees note about auto-processing
5. Clicks "Add Scholar"
6. **Result**: Scholar saved with "Processing" status

**Status Field:**
- Not visible
- Automatically set
- No selection needed

---

### Use Case 2: Updating Status (Admin)

**Steps:**
1. Admin finds scholar in table
2. Clicks edit icon
3. Reviews scholar information
4. Confirms payment was released
5. Changes status from "Processing" to "Paid"
6. Clicks "Update Scholar"
7. **Result**: Scholar status updated to "Paid"

**Status Field:**
- Visible dropdown
- Shows current status
- Can change to Paid

---

### Use Case 3: Editing Scholar Info (Staff)

**Steps:**
1. Staff finds scholar in table
2. Clicks edit icon
3. Updates scholar information (e.g., course)
4. Cannot change status (field not shown)
5. Clicks "Update Scholar"
6. **Result**: Info updated, status unchanged

**Status Field:**
- Not visible for staff
- Status remains unchanged
- Must contact admin for status changes

---

## Form Layout Changes

### Before (All Users Saw Status)
```
SCHOLARSHIP DETAILS
├─ Amount        (50% width)
└─ Status        (50% width)
```

### After - Adding New Scholar
```
SCHOLARSHIP DETAILS
├─ Amount        (100% width)
└─ Info Note     (Explains auto-processing)
```

### After - Editing (Admin)
```
SCHOLARSHIP DETAILS
├─ Amount        (50% width)
└─ Status        (50% width) + "Admin only" note
```

### After - Editing (Staff)
```
SCHOLARSHIP DETAILS
├─ Amount        (100% width)
└─ Status Info   (Read-only display)
```

---

## Technical Implementation

### Auto-Status on Create

**In Store (`scholarStore.js`):**
```javascript
addScholar: (scholar) => {
  const newScholar = {
    ...scholar,
    status: scholar.status || 'Processing', // Auto-set
    // ... other fields
  }
  // Save scholar
}
```

### Conditional Rendering

**In Form (`ScholarModal.jsx`):**
```javascript
// Show status field only when editing AND user is admin
{isEditing && userRole === 'admin' && (
  <div>
    <label>Status</label>
    <select name="status">
      <option>Processing</option>
      <option>Paid</option>
    </select>
  </div>
)}
```

### Information Note

**When adding:**
```javascript
{!isEditing && (
  <div className="info-box">
    Note: New scholars are automatically set to "Processing"
  </div>
)}
```

---

## Benefits

### For Staff
✅ Faster data entry (one less field)
✅ No confusion about which status to select
✅ Consistent workflow
✅ Cannot accidentally mark as "Paid"

### For Admins
✅ Control over payment status
✅ Clear separation of responsibilities
✅ Can update status when payment released
✅ Audit trail of status changes

### For System
✅ Data consistency
✅ Clear workflow
✅ Role-based access control
✅ Reduced errors

---

## Validation Rules

### On Create (Add Scholar)
- Amount: Required ✅
- Status: Auto-set to "Processing" ✅
- No manual status input ✅

### On Update (Edit Scholar - Admin)
- Amount: Required ✅
- Status: Required (if field shown) ✅
- Can change between Processing/Paid ✅

### On Update (Edit Scholar - Staff)
- Amount: Required ✅
- Status: Read-only (unchanged) ✅
- Cannot modify status ✅

---

## Reporting

### Filter by Status

**In Scholar Records:**
```
Status Filter: [All Status ▼]
              [Processing  ]
              [Paid        ]
```

**Results:**
- "Processing" → Shows unpaid scholars
- "Paid" → Shows scholars who received payment
- "All Status" → Shows everyone

### Statistics

**Dashboard Metrics:**
- Total Scholars (all statuses)
- Total Amount (all statuses)
- Filter by status to see:
  - Amount pending (Processing)
  - Amount disbursed (Paid)

---

## Security Considerations

### Role Verification
- Status change checks user role
- Staff role cannot modify status
- Admin role has full control

### Data Integrity
- Status cannot be empty
- Only valid values: "Processing" or "Paid"
- Auto-set on create prevents null values

---

## Future Enhancements

Possible additions:
- [ ] Status history/audit log
- [ ] Email notification on status change
- [ ] Bulk status update (admin only)
- [ ] Approval workflow (multi-level)
- [ ] Status change comments/notes
- [ ] Payment date tracking

---

## Frequently Asked Questions

**Q: Can staff change status?**
A: No, only admins can change status.

**Q: What if I want to add a scholar who is already paid?**
A: Add them normally (auto-set to Processing), then admin can immediately edit and change to Paid.

**Q: Can status go from Paid back to Processing?**
A: Yes, admins can change in either direction (though rare).

**Q: What happens if I'm staff and try to edit a paid scholar?**
A: You can edit other info (name, school, amount) but status remains unchanged.

**Q: Why can't staff change status?**
A: To maintain financial control and ensure only authorized personnel mark payments as released.

---

**Status workflow is designed for clarity, security, and efficiency!** 🎯
