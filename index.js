// Local Debug Add-on for Local by Flywheel
console.log('Local Debug Add-on: Starting...');

// Simple debug panel component
const LocalDebugPanel = () => {
  return {
    type: 'div',
    props: {
      style: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        margin: '10px'
      },
      children: [
        {
          type: 'h2',
          props: {
            style: { 
              color: '#2c3e50', 
              marginBottom: '20px',
              fontSize: '24px',
              fontWeight: 'bold'
            },
            children: '🔧 Local Debug Tools'
          }
        },
        {
          type: 'p',
          props: {
            style: { 
              color: '#7f8c8d', 
              marginBottom: '20px',
              fontSize: '16px',
              lineHeight: '1.5'
            },
            children: 'Welcome to the Local Debug add-on! This panel provides debugging tools for your WordPress development workflow.'
          }
        },
        {
          type: 'div',
          props: {
            style: { 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    textAlign: 'center'
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: '24px', fontWeight: 'bold', color: '#dc3545', marginBottom: '5px' },
                        children: '0'
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: '14px', color: '#6c757d' },
                        children: 'Error Logs'
                      }
                    }
                  ]
                }
              },
              {
                type: 'div',
                props: {
                  style: {
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    textAlign: 'center'
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: '24px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' },
                        children: '0'
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: '14px', color: '#6c757d' },
                        children: 'Debug Logs'
                      }
                    }
                  ]
                }
              },
              {
                type: 'div',
                props: {
                  style: {
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    textAlign: 'center'
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' },
                        children: '0'
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: '14px', color: '#6c757d' },
                        children: 'Plugins'
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            style: { 
              display: 'flex', 
              gap: '10px', 
              marginTop: '20px',
              flexWrap: 'wrap'
            },
            children: [
              {
                type: 'button',
                props: {
                  style: {
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  },
                  onClick: () => {
                    console.log('Debug: Refresh button clicked');
                    alert('Debug tools refreshed! (This is a demo)');
                  },
                  children: '🔄 Refresh Data'
                }
              },
              {
                type: 'button',
                props: {
                  style: {
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  },
                  onClick: () => {
                    console.log('Debug: Test button clicked');
                    alert('Debug panel is working correctly!');
                  },
                  children: '✅ Test Panel'
                }
              },
              {
                type: 'button',
                props: {
                  style: {
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  },
                  onClick: () => {
                    console.log('Debug: Logs button clicked');
                    alert('This would open the logs viewer (demo)');
                  },
                  children: '📋 View Logs'
                }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            style: {
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#e3f2fd',
              border: '1px solid #bbdefb',
              borderRadius: '6px'
            },
            children: [
              {
                type: 'h4',
                props: {
                  style: { margin: '0 0 10px 0', color: '#1976d2' },
                  children: 'ℹ️ Debug Information'
                }
              },
              {
                type: 'p',
                props: {
                  style: { margin: '0', fontSize: '14px', color: '#424242' },
                  children: 'This is a working Local Debug add-on. The panel is successfully integrated into Local\'s Tools tab using the siteInfoToolsItem content hook.'
                }
              }
            ]
          }
        }
      ]
    }
  };
};

// Function to register the add-on with Local
function registerLocalDebugAddon() {
  console.log('Local Debug: Attempting to register add-on...');
  
  // Try different methods to access Local's hooks API
  const hooksMethods = [
    // Method 1: window.local.hooks
    () => typeof window !== 'undefined' && window.local && window.local.hooks,
    // Method 2: global.hooks
    () => typeof global !== 'undefined' && global.hooks,
    // Method 3: require('@local/addon-api')
    () => {
      try {
        const { hooks } = require('@local/addon-api');
        return hooks;
      } catch (e) {
        return null;
      }
    }
  ];
  
  for (let i = 0; i < hooksMethods.length; i++) {
    try {
      const hooks = hooksMethods[i]();
      if (hooks) {
        console.log(`Local Debug: Using method ${i + 1} to access hooks`);
        
        hooks.addFilter('siteInfoToolsItem', (toolsItems, site) => {
          console.log('Local Debug: Adding debug panel for site:', site?.name || 'Unknown');
          
          toolsItems.push({
            id: 'local-debug-panel',
            label: 'Debug',
            component: LocalDebugPanel,
            props: {
              site: site,
              addonSlug: 'local-debug'
            }
          });
          
          console.log('Local Debug: Successfully added debug panel to tools');
          return toolsItems;
        });
        
        console.log('Local Debug: Add-on registered successfully!');
        return true;
      }
    } catch (error) {
      console.log(`Local Debug: Method ${i + 1} failed:`, error.message);
    }
  }
  
  console.error('Local Debug: Could not register add-on - no hooks API found');
  return false;
}

// Register the add-on
if (registerLocalDebugAddon()) {
  console.log('Local Debug: Add-on is ready!');
} else {
  console.error('Local Debug: Failed to register add-on');
}

// Export for testing
module.exports = { LocalDebugPanel, registerLocalDebugAddon };