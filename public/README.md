# Public Assets Folder

This folder contains public assets that are accessible from the application.

## Logo Placement

To use the official **Palayan City LGU Logo** on the "Palayan City LGU System" page:

1. Place the logo image file in this folder with the name: **`palayan-logo.png`**
2. Supported formats: PNG, JPG, JPEG, WebP
3. Recommended size: 200x200 pixels or larger (square ratio preferred)
4. The logo will automatically appear on the LGU System page

### File Location:
```
public/palayan-logo.png
```

If the logo file is not found, a placeholder icon will be displayed automatically.

## How to Add the Logo:

1. Get the official Palayan City LGU logo image
2. Rename it to: `palayan-logo.png` (or update the path in `src/components/LGUSystemPage.jsx`)
3. Copy the file to this `public` folder
4. Refresh the application

The logo will be displayed as a clickable link that opens https://palayancity.golgu.ph/login in a new tab.
