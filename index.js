const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

class LocalDebugAddon {
  constructor() {
    this.mainWindow = null;
    this.debugTools = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the Local Debug add-on
   */
  async initialize() {
    try {
      console.log('Initializing Local Debug add-on...');
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize debug tools
      await this.initializeDebugTools();
      
      this.isInitialized = true;
      console.log('Local Debug add-on initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Local Debug add-on:', error);
      return false;
    }
  }

  /**
   * Set up IPC event listeners for communication with Local
   */
  setupEventListeners() {
    // Listen for site selection changes
    ipcMain.on('site-selected', (event, siteData) => {
      this.handleSiteSelection(siteData);
    });

    // Listen for debug tool requests
    ipcMain.on('debug-tool-request', (event, toolName, options) => {
      this.handleDebugToolRequest(event, toolName, options);
    });

    // Listen for log requests
    ipcMain.on('get-debug-logs', (event, siteId) => {
      this.getDebugLogs(event, siteId);
    });

    // Listen for error log requests
    ipcMain.on('get-error-logs', (event, siteId) => {
      this.getErrorLogs(event, siteId);
    });

    // Listen for database query requests
    ipcMain.on('execute-db-query', (event, siteId, query) => {
      this.executeDatabaseQuery(event, siteId, query);
    });
  }

  /**
   * Initialize debug tools
   */
  async initializeDebugTools() {
    this.debugTools.set('error-log-viewer', {
      name: 'Error Log Viewer',
      description: 'View and analyze WordPress error logs',
      enabled: true
    });

    this.debugTools.set('debug-log-viewer', {
      name: 'Debug Log Viewer',
      description: 'View WordPress debug logs',
      enabled: true
    });

    this.debugTools.set('database-explorer', {
      name: 'Database Explorer',
      description: 'Browse and query the WordPress database',
      enabled: true
    });

    this.debugTools.set('performance-monitor', {
      name: 'Performance Monitor',
      description: 'Monitor site performance metrics',
      enabled: true
    });

    this.debugTools.set('plugin-analyzer', {
      name: 'Plugin Analyzer',
      description: 'Analyze plugin performance and conflicts',
      enabled: true
    });
  }

  /**
   * Handle site selection changes
   */
  handleSiteSelection(siteData) {
    console.log('Site selected:', siteData.name);
    this.currentSite = siteData;
    
    // Update debug tools with current site context
    this.updateDebugToolsContext(siteData);
  }

  /**
   * Update debug tools with current site context
   */
  updateDebugToolsContext(siteData) {
    this.debugTools.forEach((tool, toolName) => {
      tool.siteId = siteData.id;
      tool.sitePath = siteData.path;
      tool.siteUrl = siteData.url;
    });
  }

  /**
   * Handle debug tool requests
   */
  handleDebugToolRequest(event, toolName, options) {
    const tool = this.debugTools.get(toolName);
    if (!tool) {
      event.reply('debug-tool-response', { error: 'Tool not found' });
      return;
    }

    try {
      let result;
      switch (toolName) {
        case 'error-log-viewer':
          result = this.getErrorLogs(event, this.currentSite?.id);
          break;
        case 'debug-log-viewer':
          result = this.getDebugLogs(event, this.currentSite?.id);
          break;
        case 'database-explorer':
          result = this.executeDatabaseQuery(event, this.currentSite?.id, options.query);
          break;
        case 'performance-monitor':
          result = this.getPerformanceMetrics(event, this.currentSite?.id);
          break;
        case 'plugin-analyzer':
          result = this.analyzePlugins(event, this.currentSite?.id);
          break;
        default:
          result = { error: 'Unknown tool' };
      }
    } catch (error) {
      event.reply('debug-tool-response', { error: error.message });
    }
  }

  /**
   * Get debug logs for a site
   */
  getDebugLogs(event, siteId) {
    if (!this.currentSite) {
      event.reply('debug-logs-response', { error: 'No site selected' });
      return;
    }

    try {
      const debugLogPath = path.join(this.currentSite.path, 'app', 'public', 'wp-content', 'debug.log');
      
      if (fs.existsSync(debugLogPath)) {
        const logs = fs.readFileSync(debugLogPath, 'utf8');
        const logEntries = logs.split('\n').filter(line => line.trim()).map(line => {
          const match = line.match(/\[(.*?)\]/);
          return {
            timestamp: match ? match[1] : 'Unknown',
            message: line.replace(/\[.*?\]/, '').trim()
          };
        });
        
        event.reply('debug-logs-response', { logs: logEntries });
      } else {
        event.reply('debug-logs-response', { logs: [], message: 'No debug log found' });
      }
    } catch (error) {
      event.reply('debug-logs-response', { error: error.message });
    }
  }

  /**
   * Get error logs for a site
   */
  getErrorLogs(event, siteId) {
    if (!this.currentSite) {
      event.reply('error-logs-response', { error: 'No site selected' });
      return;
    }

    try {
      const errorLogPath = path.join(this.currentSite.path, 'logs', 'php', 'error.log');
      
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
        
        event.reply('error-logs-response', { logs: logEntries });
      } else {
        event.reply('error-logs-response', { logs: [], message: 'No error log found' });
      }
    } catch (error) {
      event.reply('error-logs-response', { error: error.message });
    }
  }

  /**
   * Execute database query
   */
  executeDatabaseQuery(event, siteId, query) {
    if (!this.currentSite) {
      event.reply('db-query-response', { error: 'No site selected' });
      return;
    }

    // This would typically connect to the MySQL database
    // For now, we'll return a placeholder response
    event.reply('db-query-response', { 
      message: 'Database query functionality requires MySQL connection setup',
      query: query 
    });
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(event, siteId) {
    if (!this.currentSite) {
      event.reply('performance-response', { error: 'No site selected' });
      return;
    }

    // Placeholder for performance metrics
    const metrics = {
      pageLoadTime: Math.random() * 2 + 1, // Simulated
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };

    event.reply('performance-response', { metrics });
  }

  /**
   * Analyze plugins
   */
  analyzePlugins(event, siteId) {
    if (!this.currentSite) {
      event.reply('plugin-analysis-response', { error: 'No site selected' });
      return;
    }

    try {
      const pluginsPath = path.join(this.currentSite.path, 'app', 'public', 'wp-content', 'plugins');
      
      if (fs.existsSync(pluginsPath)) {
        const plugins = fs.readdirSync(pluginsPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => ({
            name: dirent.name,
            path: path.join(pluginsPath, dirent.name),
            active: this.isPluginActive(dirent.name)
          }));

        event.reply('plugin-analysis-response', { plugins });
      } else {
        event.reply('plugin-analysis-response', { plugins: [], message: 'No plugins directory found' });
      }
    } catch (error) {
      event.reply('plugin-analysis-response', { error: error.message });
    }
  }

  /**
   * Check if a plugin is active
   */
  isPluginActive(pluginName) {
    // This would typically check the WordPress database or options
    // For now, return a random boolean
    return Math.random() > 0.5;
  }

  /**
   * Get add-on information
   */
  getAddonInfo() {
    return {
      name: 'Local Debug',
      version: '1.0.0',
      description: 'Enhanced debugging tools for WordPress development in Local',
      tools: Array.from(this.debugTools.values())
    };
  }
}

// Export the add-on class
module.exports = LocalDebugAddon;

// If this file is run directly, initialize the add-on
if (require.main === module) {
  const addon = new LocalDebugAddon();
  addon.initialize().then(success => {
    if (success) {
      console.log('Local Debug add-on is ready');
    } else {
      console.error('Failed to initialize Local Debug add-on');
      process.exit(1);
    }
  });
}