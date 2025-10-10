const { hooks } = require('@local/addon-api');

console.log('Simple test add-on: Starting...');

// Create a simple test component
const SimpleTestComponent = () => {
  return {
    type: 'div',
    props: {
      style: { padding: '20px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' },
      children: [
        {
          type: 'h2',
          props: { children: 'Simple Debug Test' }
        },
        {
          type: 'p',
          props: { children: 'If you can see this, the add-on is working!' }
        }
      ]
    }
  };
};

// Register the simple test panel
hooks.addFilter('siteInfoToolsItem', (toolsItems, site) => {
  console.log('Simple test: Adding test panel for site:', site?.name);
  
  toolsItems.push({
    id: 'simple-test-panel',
    label: 'Test Debug',
    component: SimpleTestComponent,
    props: {
      site: site
    }
  });
  
  return toolsItems;
});

console.log('Simple test add-on: Registered');