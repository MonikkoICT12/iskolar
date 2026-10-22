# Status System Reference

## Current Status Options

The scholarship system now uses a simple 2-status system focused on payment tracking:

### 1. Processing (Yellow)
- **Display**: Yellow/Amber badge
- **CSS Classes**: `bg-amber-100 text-amber-700`
- **Meaning**: Scholarship application is being processed, payment not yet released
- **Default**: This is the default status for new scholars

### 2. Paid (Green)
- **Display**: Green/Emerald badge
- **CSS Classes**: `bg-emerald-100 text-emerald-700`
- **Meaning**: Scholarship payment has been released to the scholar
- **Action**: Update scholar status to "Paid" after payment is confirmed

## Visual Reference

```
┌─────────────────────────────────────────────────────────┐
│  Status Examples                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Processing  ← Yellow badge (amber background)          │
│                                                         │
│  Paid        ← Green badge (emerald background)         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Status Workflow

```
New Scholar Added
      ↓
  Processing (Yellow) ← Default status
      ↓
  Payment Released
      ↓
  Paid (Green) ← Final status
```

## How to Change Status

### In the Application:
1. Go to "Scholar Records" tab
2. Click the **Edit** icon (pencil) next to scholar name
3. In the form, find the **Status** dropdown
4. Select "Processing" or "Paid"
5. Click "Update Scholar"

### For Admin:
- **Processing**: Scholar application received, awaiting payment
- **Paid**: Scholarship amount has been disbursed

## Filter by Status

In the Scholar Records view:
- Use the **Status** dropdown filter
- Options:
  - "All Status" - Show all scholars
  - "Processing" - Show only processing scholars
  - "Paid" - Show only paid scholars

## Technical Implementation

### Code Location

**Status Badge Function** (`ScholarRecords.jsx`):
```javascript
const getStatusBadge = (status) => {
  const badges = {
    Processing: 'bg-amber-100 text-amber-700',
    Paid: 'bg-emerald-100 text-emerald-700',
  }
  return badges[status] || 'bg-slate-100 text-slate-700'
}
```

**Status Options** (`ScholarModal.jsx`):
```javascript
<select name="status" value={formData.status} onChange={handleChange}>
  <option value="Processing">Processing</option>
  <option value="Paid">Paid</option>
</select>
```

**Default Status** (`scholarStore.js`):
```javascript
status: scholar.status || 'Processing'
```

## Color Codes

| Status | Background | Text | Hex Values |
|--------|------------|------|------------|
| Processing | `bg-amber-100` | `text-amber-700` | #FEF3C7 / #B45309 |
| Paid | `bg-emerald-100` | `text-emerald-700` | #D1FAE5 / #047857 |

## Migration Notes

If you have existing data with old status values:
- Old "Active" → Should be changed to "Processing" or "Paid"
- Old "On-Hold" → Decide: "Processing" or "Paid"
- Old "Graduated" → Typically "Paid"
- Old "Disqualified" → Remove or set to "Processing"

To bulk update existing records:
1. Export JSON backup
2. Open JSON file in text editor
3. Find and replace old status values
4. Import updated JSON

Example find/replace:
- Find: `"status": "Active"` → Replace: `"status": "Processing"`
- Find: `"status": "Graduated"` → Replace: `"status": "Paid"`

## Reporting

When generating reports:
- **Processing scholars**: Total amount pending
- **Paid scholars**: Total amount disbursed
- Use status filter to generate separate reports

## Best Practices

1. **Set to Processing** when scholar is approved but payment not yet made
2. **Update to Paid** after confirming bank transfer or cash release
3. **Keep records** - Don't delete paid scholars for audit trail
4. **Regular backups** - Export JSON after bulk payment releases
5. **Filter by status** - Generate separate reports for processing vs paid

---

**Note**: This simplified 2-status system focuses on payment tracking, making it easier to manage scholarship disbursements and financial reporting.
