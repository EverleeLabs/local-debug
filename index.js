const path = require('path');
const fs = require('fs');

console.log('Local Debug add-on: Starting initialization...');

// Check if we're running in Local's context
if (typeof window !== 'undefined' && window.local && window.local.hooks) {
  console.log('Local Debug add-on: Running in Local context');
  
  // Import the React component
  const LocalDebugPanel = require('./src/components/LocalDebugPanel.js');
  
  // Register the Debug panel in the Tools tab using content hooks
  window.local.hooks.addFilter('siteInfoToolsItem', (toolsItems, site) => {
    console.log('Local Debug add-on: Adding Debug panel to Tools tab for site:', site?.name);
    
    try {
      // Add the Debug panel to the tools items
      toolsItems.push({
        id: 'local-debug-panel',
        label: 'Debug',
        component: LocalDebugPanel,
        props: {
          site: site,
          addonSlug: 'local-debug'
        }
      });
      
      console.log('Local Debug add-on: Successfully added Debug panel');
    } catch (error) {
      console.error('Local Debug add-on: Error adding Debug panel:', error);
    }
    
    return toolsItems;
  });
} else {
  console.log('Local Debug add-on: Not running in Local context, using fallback approach');
  
  // Fallback: Try to access hooks globally
  if (typeof global !== 'undefined' && global.hooks) {
    const LocalDebugPanel = require('./src/components/LocalDebugPanel.js');
    
    global.hooks.addFilter('siteInfoToolsItem', (toolsItems, site) => {
      console.log('Local Debug add-on: Adding Debug panel to Tools tab for site:', site?.name);
      
      toolsItems.push({
        id: 'local-debug-panel',
        label: 'Debug',
        component: LocalDebugPanel,
        props: {
          site: site,
          addonSlug: 'local-debug'
        }
      });
      
      return toolsItems;
    });
  } else {
    console.error('Local Debug add-on: Could not find Local hooks API');
  }
}

console.log('Local Debug add-on: Registered Debug panel in Tools tab');

// Set up IPC event listeners for communication with Local
const { ipcMain } = require('electron');

// Listen for log requests
ipcMain.handle('get-debug-logs', async (event, siteId) => {
  return getDebugLogs(siteId);
});

// Listen for error log requests
ipcMain.handle('get-error-logs', async (event, siteId) => {
  return getErrorLogs(siteId);
});

// Listen for performance metrics requests
ipcMain.handle('get-performance-metrics', async (event, siteId) => {
  return getPerformanceMetrics(siteId);
});

// Listen for plugin analysis requests
ipcMain.handle('analyze-plugins', async (event, siteId) => {
  return analyzePlugins(siteId);
});

// Listen for database info requests
ipcMain.handle('get-database-info', async (event, siteId) => {
  return getDatabaseInfo(siteId);
});

// Listen for database query requests
ipcMain.handle('execute-db-query', async (event, siteId, query) => {
  return executeDatabaseQuery(siteId, query);
});

// Listen for log clearing requests
ipcMain.handle('clear-logs', async (event, siteId, logType) => {
  return clearLogs(siteId, logType);
});

// Helper function to get site data
async function getSiteData(siteId) {
  // This would typically get site data from Local's site manager
  // For now, return a mock site object
  return {
    id: siteId,
    name: 'Test Site',
    path: '/path/to/site',
    url: 'http://test-site.local'
  };
}

// Get debug logs for a site
async function getDebugLogs(siteId) {
  try {
    const site = await getSiteData(siteId);
    if (!site) {
      return { error: 'Site not found' };
    }

    const debugLogPath = path.join(site.path, 'app', 'public', 'wp-content', 'debug.log');
    
    if (fs.existsSync(debugLogPath)) {
      const logs = fs.readFileSync(debugLogPath, 'utf8');
      const logEntries = logs.split('\n').filter(line => line.trim()).map(line => {
        const match = line.match(/\[(.*?)\]/);
        return {
          timestamp: match ? match[1] : 'Unknown',
          message: line.replace(/\[.*?\]/, '').trim()
        };
      });
      
      return { logs: logEntries };
    } else {
      return { logs: [], message: 'No debug log found' };
    }
  } catch (error) {
    return { error: error.message };
  }
}

// Get error logs for a site
async function getErrorLogs(siteId) {
  try {
    const site = await getSiteData(siteId);
    if (!site) {
      return { error: 'Site not found' };
    }

    const errorLogPath = path.join(site.path, 'logs', 'php', 'error.log');
    
    if (fs.existsSync(errorLogPath)) {
      const logs = fs.readFileSync(errorLogPath, 'utf8');
      const logEntries = logs.split('\n').filter(line => line.trim()).map(line => {
        const match = line.match(/\[(.*?)\]/);
        return {
          timestamp: match ? match[1] : 'Unknown',
          message: line.replace(/\[.*?\]/, '').trim(),
          level: line.includes('ERROR') ? 'error' : line.includes('WARNING') ? 'warning' : 'info'
        };
      });
      
      return { logs: logEntries };
    } else {
      return { logs: [], message: 'No error log found' };
    }
  } catch (error) {
    return { error: error.message };
  }
}

// Get performance metrics
async function getPerformanceMetrics(siteId) {
  try {
    const site = await getSiteData(siteId);
    if (!site) {
      return { error: 'Site not found' };
    }

    // Placeholder for performance metrics
    const metrics = {
      pageLoadTime: Math.random() * 2 + 1, // Simulated
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };

    return { metrics };
  } catch (error) {
    return { error: error.message };
  }
}

// Analyze plugins
async function analyzePlugins(siteId) {
  try {
    const site = await getSiteData(siteId);
    if (!site) {
      return { error: 'Site not found' };
    }

    const pluginsPath = path.join(site.path, 'app', 'public', 'wp-content', 'plugins');
    
    if (fs.existsSync(pluginsPath)) {
      const plugins = fs.readdirSync(pluginsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => ({
          name: dirent.name,
          path: path.join(pluginsPath, dirent.name),
          active: Math.random() > 0.5 // Simulated
        }));

      return { plugins };
    } else {
      return { plugins: [], message: 'No plugins directory found' };
    }
  } catch (error) {
    return { error: error.message };
  }
}

// Get database info
async function getDatabaseInfo(siteId) {
  try {
    const site = await getSiteData(siteId);
    if (!site) {
      return { error: 'Site not found' };
    }

    // Placeholder for database info
    return {
      name: 'wordpress_db',
      tableCount: 12,
      size: '2.5 MB'
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Execute database query
async function executeDatabaseQuery(siteId, query) {
  try {
    const site = await getSiteData(siteId);
    if (!site) {
      return { error: 'Site not found' };
    }

    // This would typically connect to the MySQL database
    return { 
      message: 'Database query functionality requires MySQL connection setup',
      query: query 
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Clear logs
async function clearLogs(siteId, logType) {
  try {
    const site = await getSiteData(siteId);
    if (!site) {
      return { error: 'Site not found' };
    }

    let logPath;
    if (logType === 'error') {
      logPath = path.join(site.path, 'logs', 'php', 'error.log');
    } else if (logType === 'debug') {
      logPath = path.join(site.path, 'app', 'public', 'wp-content', 'debug.log');
    }

    if (logPath && fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, '');
      return { success: true, message: `${logType} logs cleared` };
    } else {
      return { error: 'Log file not found' };
    }
  } catch (error) {
    return { error: error.message };
  }
}

console.log('Local Debug add-on loaded successfully');