# PWA Manifest.json - Icon Requirements

## Required Icon Sizes for PWA

Your manifest should include the following icon sizes for optimal compatibility across all devices and platforms:

### Android (Required)
- **48×48** - Extra small
- **72×72** - Small
- **96×96** - Medium
- **144×144** - Large
- **192×192** - Extra large (minimum for Android)
- **512×512** - Maximum for Android (required for splash screens)

### iOS (Recommended)
- **16×16** - Favicon
- **32×32** - Favicon
- **60×60** - iPhone
- **76×76** - iPad
- **120×120** - iPhone Retina
- **152×152** - iPad Retina
- **180×180** - iPhone X/XS/XR
- **1024×1024** - App Store

### Windows (Optional)
- **70×70** - Small tile
- **150×150** - Medium tile
- **310×310** - Large tile
- **310×150** - Wide tile

## Current Icon Structure

```
public/icons/
├── android/
│   ├── android-launchericon-48-48.png
│   ├── android-launchericon-72-72.png
│   ├── android-launchericon-96-96.png
│   ├── android-launchericon-144-144.png
│   ├── android-launchericon-192-192.png
│   └── android-launchericon-512-512.png
├── ios/
│   ├── 16.png
│   ├── 32.png
│   ├── 60.png
│   ├── 76.png
│   ├── 120.png
│   ├── 152.png
│   ├── 180.png
│   └── 1024.png
└── windows11/
    ├── SmallTile.scale-100.png (71×71)
    ├── Square150x150Logo.scale-100.png
    ├── LargeTile.scale-100.png (310×310)
    └── [various scales]
```

## Manifest.json Icon Configuration

```json
{
  "icons": [
    {
      "src": "/icons/android/android-launchericon-48-48.png",
      "sizes": "48x48",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/android/android-launchericon-72-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/android/android-launchericon-96-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/android/android-launchericon-144-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/android/android-launchericon-192-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/android/android-launchericon-512-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Icon Purpose Property

- **any**: Standard icon for display
- **maskable**: Icon with safe zone for adaptive icons (Android)
- **monochrome**: Single color icon for theming

### Maskable Icons

Maskable icons need 20% padding (safe zone) around the main design to prevent clipping on Android adaptive icons.

```
512×512 maskable icon:
- Safe zone: 410×410 (center)
- Padding: 51px on all sides
```

## Generate Icons from Source

You can generate all required icon sizes from a single high-resolution source (1024×1024 minimum) using tools:

### Online Tools
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/
- https://progressier.com/pwa-icons-generator

### CLI Tools
```bash
# Using sharp-cli
npm install -g sharp-cli

sharp -i icon-source.png -o android-launchericon-192-192.png resize 192 192
sharp -i icon-source.png -o android-launchericon-512-512.png resize 512 512

# Using ImageMagick
convert icon-source.png -resize 192x192 android-launchericon-192-192.png
convert icon-source.png -resize 512x512 android-launchericon-512-512.png
```

## Design Guidelines

### Android
- Use PNG format
- Include transparency if needed
- Provide both 192×192 and 512×512 with "maskable" purpose
- Test with Android Maskable Icon Tool

### iOS
- Use PNG format
- No transparency (use solid background color)
- Square icons only
- 180×180 is most important for modern iPhones

### Windows
- Use PNG format
- Follow Windows design guidelines
- Provide multiple scales (100%, 125%, 150%, 200%, 400%)

## Testing Your Icons

### Chrome DevTools
1. Open DevTools → Application tab
2. Check "Manifest" section
3. Verify all icons load correctly

### Lighthouse Audit
```bash
npm run build
npm run start
# Open Chrome DevTools → Lighthouse
# Run PWA audit
```

### Real Devices
- **Android**: Install PWA, check home screen icon
- **iOS**: Add to Home Screen, check icon
- **Windows**: Install from Edge, check Start Menu

## Common Issues

### Icons not showing
- ✅ Ensure paths in manifest.json are correct
- ✅ Icons must be served over HTTPS
- ✅ Check file permissions
- ✅ Verify Content-Type header is `image/png`

### Blurry icons
- ✅ Use exact pixel dimensions (no scaling)
- ✅ Export at correct sizes from design tool
- ✅ Don't use CSS to resize

### Android adaptive icon clipping
- ✅ Use "maskable" purpose
- ✅ Add 20% safe zone padding
- ✅ Test with Maskable.app tool

## Recommended Manifest Setup (Minimal)

```json
{
  "icons": [
    {
      "src": "/icons/android/android-launchericon-192-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/android/android-launchericon-512-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

These two icons (192×192 and 512×512) are the **minimum required** for a functional PWA.

## Additional Resources

- [Web App Manifest Icons](https://web.dev/articles/add-manifest#icons)
- [Maskable Icons](https://web.dev/articles/maskable-icon)
- [PWA Icon Guidelines](https://developer.mozilla.org/en-US/docs/Web/Manifest/icons)
- [Adaptive Icon Anatomy](https://medium.com/google-design/designing-adaptive-icons-515af294c783)
