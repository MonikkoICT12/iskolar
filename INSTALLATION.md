# Installation & Setup Guide

## Prerequisites

Before you begin, make sure you have:
- **Node.js** (version 16 or higher) - Download from https://nodejs.org
- A modern web browser (Chrome, Edge, Firefox, or Safari)
- Basic terminal/command prompt knowledge

## Quick Start (Windows)

### Option 1: Double-click START.bat
1. Navigate to the project folder
2. Double-click `START.bat`
3. Wait for dependencies to install (first time only)
4. Browser will open automatically at http://localhost:5173

### Option 2: Manual Installation
1. Open Command Prompt or PowerShell
2. Navigate to project folder:
   ```
   cd C:\Users\PC1\Documents\Antigravity\Iskolar
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open http://localhost:5173 in your browser

## Detailed Installation Steps

### Step 1: Verify Node.js Installation
Open terminal and run:
```bash
node --version
```
You should see something like `v18.0.0` or higher.

If not installed:
1. Go to https://nodejs.org
2. Download the LTS version
3. Run the installer
4. Restart your terminal

### Step 2: Install Project Dependencies
In the project folder, run:
```bash
npm install
```

This will install:
- React 18
- React DOM
- Zustand (state management)
- Lucide React (icons)
- date-fns (date formatting)
- Vite (build tool)
- Tailwind CSS (styling)
- And other dependencies

**Note**: This may take 2-5 minutes depending on your internet speed.

### Step 3: Start Development Server
```bash
npm run dev
```

You should see output like:
```
  VITE v5.3.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 4: Open in Browser
1. Copy the URL shown (usually http://localhost:5173)
2. Paste it in your browser
3. The app should load!

## Building for Production

### Create Production Build
```bash
npm run build
```

This creates an optimized build in the `dist` folder.

### Preview Production Build
```bash
npm run preview
```

This starts a local server to preview the production build.

## Deployment

### Deploy to Netlify (Recommended)
1. Run `npm run build`
2. Go to https://app.netlify.com
3. Sign up/login (free)
4. Click "Add new site" → "Deploy manually"
5. Drag the `dist` folder
6. Done! You get a URL like `yoursite.netlify.app`

### Deploy to Vercel
1. Push your code to GitHub
2. Go to https://vercel.com
3. Sign up/login with GitHub
4. Click "New Project"
5. Import your repository
6. Click "Deploy"
7. Done! Auto-deploys on every push

### Deploy to GitHub Pages
1. Add to `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/iskolar",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```
2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```

## Common Issues & Solutions

### Issue: "npm is not recognized"
**Solution**: Node.js not installed or not in PATH
1. Install Node.js from https://nodejs.org
2. Restart terminal
3. Try again

### Issue: "Cannot find module"
**Solution**: Dependencies not installed
```bash
npm install
```

### Issue: Port 5173 already in use
**Solution**: Use a different port
```bash
npm run dev -- --port 3000
```

### Issue: "EACCES: permission denied"
**Solution**: Run with appropriate permissions or use nvm

### Issue: Build fails with memory error
**Solution**: Increase Node memory
```bash
set NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

### Issue: Changes not showing
**Solution**: 
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Restart dev server

### Issue: Slow installation
**Solution**:
1. Use faster internet connection
2. Try a different npm registry:
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

## Updating Dependencies

To update all dependencies to latest versions:
```bash
npm update
```

To check for outdated packages:
```bash
npm outdated
```

## Uninstalling

To remove the project:
1. Delete the `Iskolar` folder
2. That's it! No system-wide changes were made.

## Additional Commands

### Check installed packages
```bash
npm list --depth=0
```

### Clear npm cache
```bash
npm cache clean --force
```

### Reinstall everything
```bash
rm -rf node_modules package-lock.json
npm install
```

### Run with different ports
```bash
npm run dev -- --port 8080
```

### Build with debug info
```bash
npm run build -- --debug
```

## Development Workflow

1. **Make changes** to files in `src/`
2. **Save the file** (Ctrl+S)
3. **See instant updates** in browser (Hot Module Replacement)
4. **No need to refresh** manually!

## Project Structure After Installation

```
Iskolar/
├── node_modules/       # Dependencies (created after npm install)
├── dist/              # Production build (created after npm run build)
├── src/               # Your source code
├── public/            # Static assets
├── package.json       # Project configuration
└── ...config files    # Build configuration
```

## System Requirements

### Minimum
- **OS**: Windows 7+, macOS 10.13+, Linux
- **RAM**: 2 GB
- **Disk Space**: 500 MB
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Recommended
- **OS**: Windows 10/11, macOS 11+, Ubuntu 20.04+
- **RAM**: 4 GB+
- **Disk Space**: 1 GB+
- **Browser**: Latest version of Chrome, Edge, or Firefox

## Network Requirements

### Development
- No internet required after installation
- All data stored locally in browser

### Deployment
- Internet required for initial upload
- Once deployed, users need internet to access

## Data Storage

### Local Development
- Data stored in browser's LocalStorage
- Key: `iskolar-storage`
- Location: Browser's application data folder
- Size limit: ~5-10 MB (varies by browser)

### Backup
- Export data from app: "Backup & Reports" → "Export JSON"
- Save the JSON file to safe location
- Import when needed: "Import / Restore JSON"

## Getting Help

1. Check **README.md** for general information
2. Check **QUICKSTART.md** for usage guide
3. Check **PROJECT_SUMMARY.md** for technical details
4. Search GitHub issues (if applicable)
5. Contact LGU IT department

## Next Steps

After successful installation:
1. ✅ Read the **QUICKSTART.md** guide
2. ✅ Explore the app features
3. ✅ Add some test scholar records
4. ✅ Try the export/import functionality
5. ✅ Check the different views (Dashboard, School Summary, etc.)
6. ✅ Plan your deployment strategy

---

**Installation complete? Great! Now check out QUICKSTART.md to learn how to use the app.**
