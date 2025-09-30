# PWA Icons Directory

This directory contains all the PWA icons referenced in the `manifest.json`. You'll need to create these icon files:

## Required Icons:

### Main PWA Icons:
- **`icon-192x192.png`** - 192x192px PWA icon (standard size)
- **`icon-512x512.png`** - 512x512px PWA icon (high resolution)

### Browser Icons:
- **`apple-touch-icon.png`** - 180x180px Apple touch icon
- **`favicon-32x32.png`** - 32x32px favicon
- **`favicon-16x16.png`** - 16x16px favicon

### Shortcut Icons (96x96px each):
- **`shortcut-chat.png`** - Chat shortcut icon
- **`shortcut-memories.png`** - Memories shortcut icon  
- **`shortcut-todos.png`** - Todos shortcut icon

## Design Guidelines:

### Colors (from romantic palette):
- **Primary**: `#ec4899` (pink-500)
- **Secondary**: `#9c69ff` (lavender-500)
- **Background**: `#fdf2f8` (pink-50)
- **Accent**: `#22c55e` (mint-500)

### Icon Design Tips:
1. **Use a heart motif** as the primary icon element
2. **Soft rounded corners** (12-16px border radius)
3. **Gradient backgrounds** using romantic colors
4. **Simple, recognizable symbols** for shortcuts:
   - Chat: Speech bubble with heart
   - Memories: Camera or photo with heart
   - Todos: Checklist with heart

### Recommended Tools:
- **Figma** - For vector design
- **Canva** - For quick icon creation
- **GIMP/Photoshop** - For detailed editing
- **Online generators**: favicon.io, realfavicongenerator.net

## Example Icon Creation:

```bash
# Using ImageMagick to resize a master icon:
convert master-icon.png -resize 192x192 icon-192x192.png
convert master-icon.png -resize 512x512 icon-512x512.png
convert master-icon.png -resize 180x180 apple-touch-icon.png
convert master-icon.png -resize 32x32 favicon-32x32.png
convert master-icon.png -resize 16x16 favicon-16x16.png
```

## Maskable Icon Support:

Both main icons (`icon-192x192.png` and `icon-512x512.png`) are marked as `"purpose": "any maskable"` in the manifest. This means they should:

1. **Have important content in the safe zone** (center 80% of the icon)
2. **Extend to edges** for full bleed when masked
3. **Test on different mask shapes** (circle, square, rounded square)

## Testing Your Icons:

1. **PWA Builder**: https://www.pwabuilder.com/
2. **Lighthouse PWA Audit** in Chrome DevTools
3. **Maskable.app** - Test maskable icons
4. **Web App Manifest Validator**

Once you've created these icons, your PWA will have proper branding across all platforms and devices!