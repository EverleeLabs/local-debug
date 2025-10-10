// Minimal Local Debug Add-on - This should definitely work
console.log('Minimal Local Debug: Loading...');

// Very simple component
const DebugPanel = () => {
  return {
    type: 'div',
    props: {
      style: { padding: '20px', backgroundColor: '#f0f0f0' },
      children: [
        {
          type: 'h2',
          props: { children: 'Debug Tools' }
        },
        {
          type: 'p',
          props: { children: 'This is a minimal debug panel that should work!' }
        },
        {
          type: 'button',
          props: {
            style: { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' },
            onClick: () => alert('Debug panel is working!'),
            children: 'Test Button'
          }
        }
      ]
    }
  };
};

// Simple registration - no complex waiting
if (typeof window !== 'undefined' && window.local && window.local.hooks) {
  console.log('Minimal Local Debug: Registering...');
  
  window.local.hooks.addFilter('siteInfoToolsItem', (toolsItems, site) => {
    console.log('Minimal Local Debug: Adding panel for site:', site?.name);
    
    toolsItems.push({
      id: 'debug-panel',
      label: 'Debug',
      component: DebugPanel
    });
    
    return toolsItems;
  });
  
  console.log('Minimal Local Debug: Registered successfully!');
} else {
  console.log('Minimal Local Debug: Local hooks not available yet');
}

module.exports = { DebugPanel };