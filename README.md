# Iskolar ng Palayan - Scholarship Management System

A modern, full-stack scholarship management system for Palayan City LGU with dual-mode authentication, built with React, Supabase, and deployed on Vercel.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)

## 🌟 Features

### Authentication & Access Control
- **Dual Sign-In Modes**: Separate portals for Scholars and Administrators
- **School-Based Authentication**: Scholars sign in with School + School ID
- **Rate Limiting**: Protection against brute force attacks (5 attempts, 5-min lockout)
- **Session Management**: Auto-logout after inactivity (30min admin, 15min scholar)
- **Role-Based Access**: Admins have full CRUD access, scholars have read-only view

### Scholar Management
- **Complete CRUD Operations**: Create, Read, Update, Delete scholar records
- **Bulk Actions**: Mark multiple scholars as "Paid" at once
- **Advanced Search**: Search by name, School ID, course, school, or barangay
- **Multi-Filter**: Filter by barangay, school, year level, semester, status
- **Unique School IDs**: Each scholar has a unique identifier (e.g., NE-0001, WUP-0016)
- **Input Validation**: Name fields accept only letters, spaces, hyphens, and apostrophes

### Data & Analytics
- **Dashboard Overview**: Real-time statistics with gradient cards
- **School Summary**: View scholars grouped by university
- **Year Level Stats**: Compare scholarship distribution across year levels
- **Status Tracking**: Monitor Processing vs Paid scholarships
- **School Year Management**: Switch between academic years

### User Experience
- **Modern UI**: Clean Linear/Stripe-style design with glassmorphism
- **Responsive Design**: Works on desktop, tablet, and mobile
- **System Color Palette**: Consistent #007AFF blue accent throughout
- **Accessible**: WCAG-compliant color contrasts and keyboard navigation
- **Print Support**: Print-ready official reports

### Data Management
- **Supabase Backend**: PostgreSQL database with Row Level Security (RLS)
- **Real-time Sync**: Changes reflect immediately across all sessions
- **Export/Import**: JSON backup and restore functionality
- **Sample Data**: Load 75 or 100 scholars with one click for testing

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MonikkoICT12/iskolar)

1. Click the button above
2. Follow the [Deployment Guide](DEPLOYMENT.md)
3. Set up your Supabase database
4. Add environment variables in Vercel
5. Deploy! 🎉

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/MonikkoICT12/iskolar.git
cd iskolar

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_anon_key

# Start development server
npm run dev
```

Visit `http://localhost:5173` (or the port shown in terminal)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Vercel account (free tier available)
- Git and GitHub account

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Save your database password

### 2. Run Database Schema

1. Open Supabase SQL Editor
2. Copy contents of `supabase-schema.sql`
3. Paste and run the script
4. Tables and policies will be created automatically

### 3. Get API Keys

1. Go to Project Settings → API
2. Copy **Project URL** and **anon public** key
3. Add to `.env` file or Vercel environment variables

## 🔐 Authentication

### Admin Access

**Default Credentials** (change in production):
- Username: `admin`
- Password: `admin123`

Admins can:
- ✅ Add, edit, delete scholars
- ✅ View all scholar records
- ✅ Bulk update statuses
- ✅ Export and import data
- ✅ Access all tabs and features

### Scholar Access

**Sign-In Process**:
1. Select school from dropdown
2. Enter unique School ID (e.g., `NE-0001`)
3. View personal scholarship details (read-only)

Scholars can:
- ✅ View their own record only
- ✅ See scholarship amount and status
- ✅ View personal and academic information
- ❌ Cannot edit or see other scholars

## 🏫 School ID System

Each university has a unique prefix:

- **NE-####** - Nueva Ecija University of Science and Technology
- **WUP-####** - Wesleyan University Philippines
- **CLSU-####** - Central Luzon State University
- **CCP-####** - Central Colleges of the Philippines
- **TSU-####** - Tarlac State University

Example: `NE-0001`, `WUP-0016`, `CLSU-0042`

## 📊 Sample Data

Load pre-made sample data for testing:

### Option 1: 100 Scholars with School IDs
- 20 scholars per university
- All have unique School IDs
- Complete contact information
- Mix of Processing and Paid statuses

### Option 2: 75 Scholars without IDs
- 15 scholars per university
- Need to add School IDs manually
- For testing the School ID workflow

**How to Load:**
1. Sign in as admin
2. Go to "Reports" tab
3. Click "Load 100 Scholars ⭐" or "Load 75 Scholars"

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **Vite 5.3** - Build tool and dev server
- **Tailwind CSS 3.4** - Styling
- **Lucide React** - Icon system
- **Zustand 4.5** - State management
- **React Router DOM 6** - Routing
- **date-fns 3.6** - Date formatting

### Backend
- **Supabase** - PostgreSQL database
- **Supabase Auth** - Authentication
- **Row Level Security** - Data protection
- **Supabase Functions** - Serverless functions

### Deployment
- **Vercel** - Hosting and CI/CD
- **GitHub** - Version control
- **Environment Variables** - Secret management

## 📁 Project Structure

```
iskolar/
├── src/
│   ├── components/         # React components
│   │   ├── SignIn.jsx     # Dual-mode sign-in page
│   │   ├── ScholarPortal.jsx  # Scholar read-only view
│   │   ├── Dashboard.jsx  # Admin dashboard
│   │   ├── ScholarRecords.jsx # CRUD table
│   │   └── ...
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx    # Authentication logic
│   ├── lib/               # Libraries
│   │   └── supabase.js    # Supabase client
│   ├── store/             # Zustand stores
│   │   └── scholarStore.js    # Scholar state management
│   ├── utils/             # Utility functions
│   │   ├── helpers.js     # Format helpers
│   │   ├── schools.js     # School list
│   │   └── scholars100.js # Sample data
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── supabase-schema.sql    # Database schema
├── vercel.json            # Vercel configuration
├── DEPLOYMENT.md          # Deployment guide
└── package.json           # Dependencies

```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Admin Credentials (Development Only)
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=admin123
```

### Vercel Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🚨 Security

### Production Recommendations

⚠️ **IMPORTANT**: This system uses front-end authentication for development. For production:

1. **Change Admin Password**
   - Update bcrypt hash in Supabase `admins` table
   - Use strong password (16+ characters)

2. **Enable Row Level Security**
   - Already configured in schema
   - Review policies regularly

3. **Use HTTPS Only**
   - Automatically enabled on Vercel
   - Force HTTPS redirects

4. **Rate Limiting**
   - Built-in: 5 attempts, 5-minute lockout
   - Consider adding Vercel Edge Functions for IP-based limiting

5. **Environment Variables**
   - Never commit `.env` to Git
   - Use Vercel's secret management
   - Rotate keys periodically

6. **Database Backups**
   - Enable daily backups in Supabase
   - Export data regularly

### Security Features

✅ Rate limiting on sign-in attempts  
✅ Session timeout after inactivity  
✅ Row Level Security (RLS) in database  
✅ Input validation and sanitization  
✅ School ID uniqueness enforcement  
✅ HTTPS encryption (Vercel)  
✅ Secure password hashing (bcrypt)

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[Login System Docs](LOGIN_SYSTEM.md)** - Authentication documentation
- **Supabase Schema** - See `supabase-schema.sql` for database structure

## 🐛 Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**
- Check `.env` file exists and has correct values
- Verify Vercel environment variables are set
- Redeploy after adding variables

**Can't sign in as admin**
- Verify username and password in `.env`
- Check Supabase `admins` table has the admin record
- Review browser console (F12) for errors

**Scholars not saving**
- Check Supabase connection (green indicator)
- Verify RLS policies are correct
- Check for duplicate School IDs

**Deploy failed on Vercel**
- Review build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Try manual redeploy

## 📈 Roadmap

- [ ] Email notifications for scholarship payments
- [ ] SMS integration for scholar alerts
- [ ] Document upload (IDs, certificates)
- [ ] Advanced reporting (PDF generation)
- [ ] Multi-year comparison analytics
- [ ] Scholar application portal
- [ ] Payment gateway integration

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Palayan City LGU** - Initial requirements
- **Development Team** - Implementation

## 🙏 Acknowledgments

- Nueva Ecija Province for university data
- Palayan City LGU for project requirements
- Open source community for amazing tools

## 📞 Support

For issues and questions:
- **GitHub Issues**: [Create an issue](https://github.com/MonikkoICT12/iskolar/issues)
- **Email**: support@palayancity.gov.ph
- **Documentation**: See DEPLOYMENT.md and LOGIN_SYSTEM.md

## 💰 Cost

**Free Tier Limits:**
- Vercel: 100 GB bandwidth/month, unlimited deployments
- Supabase: 500 MB database, 50K monthly active users

**Estimated cost: $0/month** for typical LGU usage

## 🌐 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ❌ Internet Explorer (not supported)

---

Made with ❤️ for Palayan City, Nueva Ecija
