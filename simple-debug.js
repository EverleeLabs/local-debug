// Simple Local Debug Add-on
console.log('Simple Local Debug Add-on: Loading...');

// Simple test component
const SimpleDebugPanel = () => {
  return {
    type: 'div',
    props: {
      style: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        margin: '10px'
      },
      children: [
        {
          type: 'h2',
          props: {
            style: { color: '#495057', marginBottom: '15px' },
            children: '🔧 Local Debug Tools'
          }
        },
        {
          type: 'p',
          props: {
            style: { color: '#6c757d', marginBottom: '10px' },
            children: 'This is a simple debug panel for Local by Flywheel.'
          }
        },
        {
          type: 'div',
          props: {
            style: { 
              display: 'flex', 
              gap: '10px', 
              marginTop: '15px' 
            },
            children: [
              {
                type: 'button',
                props: {
                  style: {
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  },
                  onClick: () => console.log('Debug button clicked!'),
                  children: 'Test Debug'
                }
              },
              {
                type: 'button',
                props: {
                  style: {
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  },
                  onClick: () => alert('Debug panel is working!'),
                  children: 'Test Alert'
                }
              }
            ]
          }
        }
      ]
    }
  };
};

// Try different ways to access Local's hooks
function registerAddon() {
  console.log('Simple Local Debug: Attempting to register add-on...');
  
  // Method 1: Try window.local.hooks
  if (typeof window !== 'undefined' && window.local && window.local.hooks) {
    console.log('Simple Local Debug: Using window.local.hooks');
    window.local.hooks.addFilter('siteInfoToolsItem', (toolsItems, site) => {
      console.log('Simple Local Debug: Adding panel for site:', site?.name);
      toolsItems.push({
        id: 'simple-debug-panel',
        label: 'Debug',
        component: SimpleDebugPanel
      });
      return toolsItems;
    });
    return true;
  }
  
  // Method 2: Try global hooks
  if (typeof global !== 'undefined' && global.hooks) {
    console.log('Simple Local Debug: Using global.hooks');
    global.hooks.addFilter('siteInfoToolsItem', (toolsItems, site) => {
      console.log('Simple Local Debug: Adding panel for site:', site?.name);
      toolsItems.push({
        id: 'simple-debug-panel',
        label: 'Debug',
        component: SimpleDebugPanel
      });
      return toolsItems;
    });
    return true;
  }
  
  // Method 3: Try require('@local/addon-api')
  try {
    const { hooks } = require('@local/addon-api');
    console.log('Simple Local Debug: Using @local/addon-api');
    hooks.addFilter('siteInfoToolsItem', (toolsItems, site) => {
      console.log('Simple Local Debug: Adding panel for site:', site?.name);
      toolsItems.push({
        id: 'simple-debug-panel',
        label: 'Debug',
        component: SimpleDebugPanel
      });
      return toolsItems;
    });
    return true;
  } catch (e) {
    console.log('Simple Local Debug: @local/addon-api not available');
  }
  
  console.error('Simple Local Debug: Could not find Local hooks API');
  return false;
}

// Register the add-on
if (registerAddon()) {
  console.log('Simple Local Debug: Successfully registered!');
} else {
  console.error('Simple Local Debug: Failed to register');
}

// Export for testing
module.exports = { SimpleDebugPanel, registerAddon };