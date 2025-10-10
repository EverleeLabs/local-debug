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