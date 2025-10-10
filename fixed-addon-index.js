// Local Debug Add-on - Fixed Version
console.log('Local Debug Add-on: Starting...');

// Simple debug component
const LocalDebugPanel = () => {
  return {
    type: 'div',
    props: {
      style: {
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
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
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: '600'
            },
            children: '🔧 Local Debug Tools'
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
            children: 'This is a working Local Debug add-on panel!'
          }
        },
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
              console.log('Debug panel button clicked!');
              alert('🎉 Debug panel is working correctly!');
            },
            children: '✅ Test Debug Panel'
          }
        }
      ]
    }
  };
};

// Wait for Local to be ready, then register
function waitForLocal() {
  if (typeof window !== 'undefined' && window.local && window.local.hooks) {
    console.log('Local Debug: Local hooks found, registering...');
    
    window.local.hooks.addFilter('siteInfoToolsItem', (toolsItems, site) => {
      console.log('Local Debug: Adding debug panel for site:', site?.name);
      
      toolsItems.push({
        id: 'local-debug-panel',
        label: 'Debug',
        component: LocalDebugPanel,
        props: {
          site: site,
          addonSlug: 'local-debug'
        }
      });
      
      console.log('Local Debug: Successfully added debug panel');
      return toolsItems;
    });
    
    console.log('Local Debug: Successfully registered!');
    return true;
  }
  return false;
}

// Try to register immediately
if (!waitForLocal()) {
  // If not ready, wait and try again
  console.log('Local Debug: Waiting for Local to be ready...');
  
  const checkInterval = setInterval(() => {
    if (waitForLocal()) {
      clearInterval(checkInterval);
    }
  }, 100);
  
  // Stop trying after 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
    console.error('Local Debug: Failed to register after 10 seconds');
  }, 10000);
}

module.exports = { LocalDebugPanel };