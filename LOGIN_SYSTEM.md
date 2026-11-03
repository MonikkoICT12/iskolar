# Login System Documentation

## Overview

The Iskolar Scholarship Management System now includes a dual-mode authentication system that supports both **Admin** and **Scholar** access through a single sign-in page.

## Features

### Two Sign-In Modes

#### 1. **Scholar Mode**
- Scholars sign in using their unique **School ID**
- Read-only access to their personal scholarship record
- View scholarship status, amount, and academic information
- Session expires after 15 minutes of inactivity

#### 2. **Admin Mode**
- Administrators sign in with **username** and **password**
- Full access to all scholarship management features
- CRUD operations on scholar records
- Session expires after 30 minutes of inactivity

### Security Features

- **Rate Limiting**: Maximum 5 failed sign-in attempts
- **Account Lockout**: 5 minutes lockout after exceeding attempts
- **Session Management**: Auto-logout on inactivity
- **School ID Validation**: Case-insensitive unique School IDs
- **Protected Routes**: Automatic redirection based on authentication status

## Admin Credentials

### Development Setup

Admin credentials are stored in the `.env` file:

```env
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=admin123
```

### Changing Admin Credentials

1. Open `.env` file in the project root
2. Update the values:
   ```env
   VITE_ADMIN_USERNAME=your_username
   VITE_ADMIN_PASSWORD=your_password
   ```
3. Restart the development server

## School ID Field

### Requirements

- **Required**: Every scholar must have a unique School ID
- **Uniqueness**: Case-insensitive validation (e.g., "ABC123" = "abc123")
- **Portal Access**: Scholars use this ID to sign in and view their record

### Adding School IDs to Existing Scholars

1. Sign in as **Admin**
2. Go to **Scholars** tab
3. Edit each scholar record
4. Fill in the **School ID** field in the "Contact & Identification" section
5. Save changes

**Note**: Scholars without a School ID will show a "Missing ID" badge in the table.

## Usage Guide

### For Administrators

1. Navigate to the system URL
2. Click the **Admin Sign In** tab
3. Enter your username and password
4. Click **Sign In as Admin**
5. Manage all scholarship records
6. Click the **Sign Out** icon (top-right) when done

### For Scholars

1. Navigate to the system URL
2. The **Scholar Sign In** tab is selected by default
3. Enter your **School ID**
4. Click **Sign In**
5. View your scholarship information
6. Click **Sign Out** (top-right) when done

## Routes

- `/` - Sign-in page (redirects if already authenticated)
- `/admin` - Admin dashboard (protected)
- `/scholar-portal` - Scholar portal (protected)

## Error Messages

### Scholar Sign In
- **"Scholar not found"**: School ID does not exist in the system
- **"Please enter your School ID"**: Field is empty
- **"Too many failed attempts"**: Rate limit exceeded, wait 5 minutes

### Admin Sign In
- **"Invalid username or password"**: Credentials do not match
- **"Too many failed attempts"**: Rate limit exceeded, wait 5 minutes

## Session Behavior

### Auto-Logout
- **Admin**: 30 minutes of inactivity
- **Scholar**: 15 minutes of inactivity
- Activity is tracked on any interaction with the system

### Manual Sign Out
- Click the sign out icon in the top-right corner
- Immediately clears session and returns to sign-in page

## Security Warnings

### ⚠️ Development Mode Only

**The current implementation is for DEVELOPMENT purposes only** and has the following limitations:

1. **Client-Side Only**: No backend server
2. **Plain-Text Credentials**: Admin password visible in `.env`
3. **Client-Side Storage**: Sessions stored in browser localStorage
4. **No Encryption**: Data transmitted without encryption
5. **No Password Hashing**: Passwords not hashed

### 🔒 Production Requirements

Before deploying to production, you **MUST** implement:

1. **Backend Authentication Server**
   - Node.js/Express, Python/Django, or similar
   - Secure API endpoints for authentication

2. **Database**
   - PostgreSQL, MySQL, or similar
   - Encrypted password storage (bcrypt, Argon2)

3. **HTTPS**
   - SSL/TLS certificates
   - Encrypted data transmission

4. **Proper Session Management**
   - HTTP-only cookies
   - CSRF protection
   - Secure session storage

5. **Password Security**
   - Hashing with salt
   - Strong password requirements
   - Password reset functionality

6. **Environment Security**
   - Environment variables on server
   - No credentials in client code
   - Secrets management system

## Technical Implementation

### Files Created

1. `src/contexts/AuthContext.jsx` - Authentication context and logic
2. `src/components/SignIn.jsx` - Sign-in page with dual modes
3. `src/components/ScholarPortal.jsx` - Scholar read-only view
4. `src/components/ProtectedRoute.jsx` - Route protection component
5. `.env` - Admin credentials (not committed to git)
6. `.env.example` - Template for environment variables

### Files Modified

1. `src/store/scholarStore.js` - Added School ID validation
2. `src/components/ScholarModal.jsx` - Added School ID field
3. `src/components/ScholarRecords.jsx` - Added School ID column and search
4. `src/components/Header.jsx` - Added sign out button
5. `src/App.jsx` - Added routing and authentication
6. `src/main.jsx` - Added BrowserRouter and AuthProvider
7. `.gitignore` - Added `.env` files to ignore list

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Internet Explorer: ❌ Not supported

## Troubleshooting

### "Scholar not found" Error
- Verify the School ID is correct
- Check if the scholar record has a School ID assigned
- School IDs are case-insensitive

### Admin Can't Sign In
- Check `.env` file exists in project root
- Verify credentials match `.env` values
- Restart dev server after changing `.env`

### Rate Limit Lockout
- Wait 5 minutes before trying again
- Clear browser localStorage if needed: `localStorage.clear()`

### Session Expired
- Normal behavior after inactivity period
- Simply sign in again

## Support

For issues or questions:
1. Check this documentation first
2. Review the security warnings
3. Verify all required fields are filled
4. Check browser console for error messages
