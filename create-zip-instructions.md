# Local Debug Add-on - Download Instructions

## Quick Setup

1. **Create a folder** called `local-debug-addon` on your computer
2. **Create these 3 files** in that folder:

### File 1: `index.js`
```javascript
// Local Debug Add-on
console.log('Local Debug Add-on: Loading...');

// Simple debug component
const DebugPanel = () => {
  return {
    type: 'div',
    props: {
      style: {
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#ffffff',
        border: '1px solid #e1e5e9',
        borderRadius: '8px'
      },
      children: [
        {
          type: 'h2',
          props: {
            style: { 
              color: '#2c3e50', 
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: '600'
            },
            children: '🔧 Debug Tools'
          }
        },
        {
          type: 'p',
          props: {
            style: { 
              color: '#6c757d', 
              marginBottom: '16px',
              fontSize: '14px'
            },
            children: 'This is a working Local Debug add-on panel.'
          }
        },
        {
          type: 'button',
          props: {
            style: {
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            },
            onClick: () => alert('Debug panel is working!'),
            children: 'Test Debug Panel'
          }
        }
      ]
    }
  };
};

// Register with Local's hooks system
try {
  // Try to get hooks from various possible locations
  let hooks = null;
  
  if (typeof window !== 'undefined' && window.local && window.local.hooks) {
    hooks = window.local.hooks;
  } else if (typeof global !== 'undefined' && global.hooks) {
    hooks = global.hooks;
  } else {
    // Try requiring the addon API
    try {
      const addonAPI = require('@local/addon-api');
      hooks = addonAPI.hooks;
    } catch (e) {
      console.log('Local Debug: Could not require @local/addon-api');
    }
  }
  
  if (hooks) {
    console.log('Local Debug: Found hooks API, registering add-on...');
    
    hooks.addFilter('siteInfoToolsItem', (toolsItems, site) => {
      console.log('Local Debug: Adding debug panel for site:', site?.name);
      
      toolsItems.push({
        id: 'local-debug-panel',
        label: 'Debug',
        component: DebugPanel
      });
      
      return toolsItems;
    });
    
    console.log('Local Debug: Successfully registered!');
  } else {
    console.error('Local Debug: Could not find Local hooks API');
  }
} catch (error) {
  console.error('Local Debug: Error registering add-on:', error);
}

module.exports = { DebugPanel };
```

### File 2: `package.json`
```json
{
  "name": "local-debug",
  "version": "1.0.0",
  "description": "A Local by Flywheel add-on for debugging WordPress sites",
  "main": "index.js",
  "author": "Local Debug Add-on",
  "license": "MIT",
  "keywords": ["local", "flywheel", "wordpress", "debug", "development"],
  "engines": {
    "node": ">=12.0.0",
    "local": ">=6.0.0"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### File 3: `addon.json`
```json
{
  "name": "Local Debug",
  "slug": "local-debug",
  "version": "1.0.0",
  "description": "Enhanced debugging tools for WordPress development in Local by Flywheel",
  "author": "Local Debug Team",
  "main": "index.js",
  "engines": {
    "local": ">=6.0.0"
  }
}
```

## Installation Steps

1. **Create the folder and files** as shown above
2. **Zip the folder** (right-click → "Send to" → "Compressed folder" on Windows, or "Compress" on Mac)
3. **Open Local by Flywheel**
4. **Go to Add-ons** → **"Add from Disk"**
5. **Select the ZIP file** you just created
6. **Restart Local** if prompted
7. **Test**: Open any site → Tools tab → Look for "Debug" panel

## Alternative: Direct Folder Installation

Instead of zipping, you can also:
1. Create the folder with the 3 files
2. In Local: Add-ons → "Add from Disk"
3. Select the **folder** (not ZIP file)
4. Click "Open"

The add-on will add a "Debug" panel to each site's Tools tab!