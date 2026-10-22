# Iskolar - Palayan City LGU Scholarship Management System

A modern, React-based scholarship management system for Palayan City LGU with automatic local storage, export/import capabilities, and comprehensive reporting features.

## 🚀 Features

### Core Functionality
- **Scholar Management**: Add, edit, delete, and search scholar records
- **Auto-Save**: All data automatically saved to browser's local storage
- **Advanced Filtering**: Filter by barangay, school, year level, and status
- **Real-time Search**: Quick search across all scholar fields

### Analytics & Reporting
- **Dashboard Overview**: Key metrics and statistics at a glance
- **School Summary**: Detailed breakdown by educational institution
- **Year Level Stats**: Distribution analysis across year levels
- **Backup & Export**: JSON export/import for data portability
- **Print Reports**: Professional print-ready reports

### User Experience
- **Role-Based Access**: Admin (full access) and Staff (read/add only)
- **School Year Filtering**: Multi-year data management
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Toast Notifications**: Real-time feedback for all actions

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm/yarn

### Setup Steps

1. **Install dependencies**:
```bash
npm install
```

2. **Run development server**:
```bash
npm run dev
```

3. **Build for production**:
```bash
npm run build
```

4. **Preview production build**:
```bash
npm run preview
```

## 🌐 Deployment Options

### Option 1: Netlify (Easiest)
1. Build your project: `npm run build`
2. Sign up at [netlify.com](https://netlify.com)
3. Drag and drop the `dist` folder
4. Get instant website link (yoursite.netlify.app)

### Option 2: Vercel
1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel auto-detects Vite and deploys
4. Get professional domain (yoursite.vercel.app)

### Option 3: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Run: `npm run deploy`
4. Access at: username.github.io/iskolar

## 📁 Project Structure

```
iskolar/
├── src/
│   ├── components/         # React components
│   │   ├── Header.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ScholarRecords.jsx
│   │   ├── SchoolSummary.jsx
│   │   ├── YearLevelStats.jsx
│   │   ├── BackupReports.jsx
│   │   ├── ScholarModal.jsx
│   │   ├── HelpModal.jsx
│   │   └── Toast.jsx
│   ├── store/              # State management
│   │   └── scholarStore.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
└── tailwind.config.js      # Tailwind configuration
```

## 💾 Data Management

### Local Storage
- All data automatically saved to browser's LocalStorage
- No manual save required
- Data persists across sessions
- Key: `iskolar-storage`

### Backup & Export
1. Go to "Backup & Reports" tab
2. Click "Export / Backup JSON"
3. Save the JSON file to safe location
4. To restore: Click "Import / Restore JSON" and select file

### Moving to Another Computer
1. Export data from old computer
2. Send JSON file to new computer (email, USB, cloud)
3. Import the JSON file on new computer

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
```javascript
colors: {
  lgu: {
    blue: '#0F2C59',    // Primary blue
    navy: '#0B1E3D',    // Dark navy
    gold: '#DAA520',    // Gold accent
    // ... add more colors
  }
}
```

### Barangays
Edit `src/store/scholarStore.js` to update barangay list:
```javascript
const BARANGAYS = [
  'Atate', 'Caballero', 'Caimito',
  // ... add more barangays
]
```

## 🔒 Security Notes

- Data stored locally in browser (not sent to any server)
- No user authentication required for local use
- For online deployment, consider adding authentication
- Regular backups recommended

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## 🤝 Contributing

This project was built for Palayan City LGU. Contributions and improvements are welcome!

## 📄 License

Built for public use by Palayan City LGU.

## 📞 Support

For questions or issues, contact the LGU IT department.

---

**Built with ❤️ for Palayan City LGU**
