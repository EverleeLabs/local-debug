
const fs = require('fs');
const path = require('path');
const os = require('os');

// Log immediately when module is loaded - also write to file for easier debugging
console.log('WP Debug Toggler: main.ts file loaded at module level');
try {
  const logPath = require('path').join(require('os').homedir(), 'wp-debug-toggler-main.log');
  require('fs').appendFileSync(logPath, `[${new Date().toISOString()}] Module loaded at top level\n`);
} catch (e) {}

// Try to access ipcMain directly - maybe Local passes it differently
let ipcMain: any = null;
let shell: any = null;

// Helper functions that don't need context
const WP_STOP_MARKER = "/* That's all, stop editing!";

function expandPath(sitePath: string): string {
  if (sitePath.startsWith('~')) {
    return sitePath.replace('~', os.homedir());
  }
  return sitePath;
}

function findWpRoot(sitePath: string): string {
  const expandedPath = expandPath(sitePath);
  const candidates = [
    path.join(expandedPath, 'app', 'public'),
    expandedPath,
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(path.join(p, 'wp-config.php'))) return p;
    } catch (_) {}
  }
  return candidates[0];
}

function getPaths(sitePath: string) {
  const wpRoot = findWpRoot(sitePath);
  const configPath = path.join(wpRoot, 'wp-config.php');
  const defaultLogPath = path.join(wpRoot, 'wp-content', 'debug.log');
  return { wpRoot, configPath, defaultLogPath };
}

function readConfig(configPath: string) {
  const raw = fs.readFileSync(configPath, 'utf8');
  const readBool = (name: string) => {
    const re = new RegExp(`define\\(\\s*['\"]${name}['\"]\\s*,\\s*(true|false)\\s*\\)\\s*;`, 'i');
    const m = raw.match(re);
    return m ? m[1].toLowerCase() === 'true' : false;
  };
  return {
    WP_DEBUG: readBool('WP_DEBUG'),
    WP_DEBUG_DISPLAY: readBool('WP_DEBUG_DISPLAY'),
    WP_DEBUG_LOG: readBool('WP_DEBUG_LOG'),
    _raw: raw,
  };
}

function writeConfig(configPath: string, next: any) {
  let raw = fs.readFileSync(configPath, 'utf8');
  const bakPath = configPath + '.wpdebug.bak';
  try {
    if (!fs.existsSync(bakPath)) fs.writeFileSync(bakPath, raw, 'utf8');
  } catch (_) {}

  const putBool = (name: string, val: boolean) => {
    const defRe = new RegExp(`define\\(\\s*['\"]${name}['\"]\\s*,\\s*(true|false)\\s*\\)\\s*;`, 'i');
    if (defRe.test(raw)) {
      raw = raw.replace(defRe, `define('${name}', ${val ? 'true' : 'false'});`);
    } else {
      const insert = `\n// Added by Local Add-on: WP Debug Toggler\n` +
        `define('${name}', ${val ? 'true' : 'false'});\n`;
      const idx = raw.indexOf(WP_STOP_MARKER);
      raw = idx !== -1 ? raw.slice(0, idx) + insert + raw.slice(idx) : raw + insert;
    }
  };

  putBool('WP_DEBUG', !!next.WP_DEBUG);
  putBool('WP_DEBUG_DISPLAY', !!next.WP_DEBUG_DISPLAY);
  putBool('WP_DEBUG_LOG', !!next.WP_DEBUG_LOG);

  fs.writeFileSync(configPath, raw, 'utf8');
}

function ensureFile(pth: string) {
  try {
    if (!fs.existsSync(pth)) fs.writeFileSync(pth, '', 'utf8');
  } catch (_) {}
}

// Register handlers function
function registerHandlers() {
  if (!ipcMain) {
    console.error('WP Debug Toggler: Cannot register handlers - ipcMain not available');
    return;
  }

  console.log('WP Debug Toggler: Registering IPC handlers at module load time');
  try {
    const logPath = require('path').join(require('os').homedir(), 'wp-debug-toggler-main.log');
    require('fs').appendFileSync(logPath, `[${new Date().toISOString()}] Registering handlers at module load\n`);
  } catch (e) {}

  ipcMain.handle('wpdebug:getState', (evt: any, { sitePath }: any) => {
    console.log('WP Debug Toggler: getState called with sitePath:', sitePath);
    try {
      const { configPath, defaultLogPath } = getPaths(sitePath);
      const cfg = readConfig(configPath);
      console.log('WP Debug Toggler: Config read successfully');
      return {
        WP_DEBUG: cfg.WP_DEBUG,
        WP_DEBUG_DISPLAY: cfg.WP_DEBUG_DISPLAY,
        WP_DEBUG_LOG: cfg.WP_DEBUG_LOG,
        logPath: defaultLogPath,
      };
    } catch (err: any) {
      console.error('WP Debug Toggler: Error in getState:', err);
      throw err;
    }
  });

  ipcMain.handle('wpdebug:setState', (evt: any, { sitePath, state }: any) => {
    const { configPath, defaultLogPath } = getPaths(sitePath);
    writeConfig(configPath, state);
    if (state.WP_DEBUG && state.WP_DEBUG_LOG) {
      ensureFile(defaultLogPath);
    }
    return true;
  });

  ipcMain.handle('wpdebug:readLog', (evt: any, { sitePath, logPath }: any) => {
    const { defaultLogPath } = getPaths(sitePath);
    const p = logPath || defaultLogPath;
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
      return '';
    } catch (e: any) {
      return `Error reading log: ${e.message}`;
    }
  });

  ipcMain.handle('wpdebug:openLog', async (evt: any, { sitePath, logPath }: any) => {
    const { defaultLogPath } = getPaths(sitePath);
    const p = logPath || defaultLogPath;
    ensureFile(p);
    try {
      if (shell) {
        await shell.openPath(p);
      }
      return true;
    } catch (e) {
      return false;
    }
  });

  ipcMain.handle('wpdebug:clearLog', (evt: any, { sitePath, logPath }: any) => {
    const { defaultLogPath } = getPaths(sitePath);
    const p = logPath || defaultLogPath;
    try {
      // Truncate the file by writing an empty string
      fs.writeFileSync(p, '', 'utf8');
      return true;
    } catch (e: any) {
      throw new Error(`Failed to clear log: ${e.message}`);
    }
  });

  console.log('WP Debug Toggler: All IPC handlers registered successfully at module load');
  try {
    const logPath = require('path').join(require('os').homedir(), 'wp-debug-toggler-main.log');
    require('fs').appendFileSync(logPath, `[${new Date().toISOString()}] All handlers registered successfully\n`);
  } catch (e) {}
}

// Try getting ipcMain from electron if available globally
try {
  const electron = require('electron');
  if (electron && electron.ipcMain) {
    ipcMain = electron.ipcMain;
    shell = electron.shell;
    console.log('WP Debug Toggler: Got ipcMain directly from electron module');
    try {
      const logPath = require('path').join(require('os').homedir(), 'wp-debug-toggler-main.log');
      require('fs').appendFileSync(logPath, `[${new Date().toISOString()}] Got ipcMain from electron module directly\n`);
    } catch (e) {}
    
    // Register handlers immediately since we have ipcMain!
    registerHandlers();
  }
} catch (e: any) {
  console.log('WP Debug Toggler: Could not get electron directly:', e.message);
}

module.exports = (context: any) => {
  // Write to log file for easier debugging
  const logPath = require('path').join(require('os').homedir(), 'wp-debug-toggler-main.log');
  try {
    require('fs').appendFileSync(logPath, `[${new Date().toISOString()}] module.exports function CALLED\n`);
    require('fs').appendFileSync(logPath, `[${new Date().toISOString()}] Context: ${context ? 'present' : 'missing'}\n`);
  } catch (e) {}
  
  console.log('WP Debug Toggler: module.exports function CALLED');
  
  // If handlers weren't registered yet, try from context
  if (!ipcMain && context && context.electron) {
    ipcMain = context.electron.ipcMain;
    shell = context.electron.shell;
    if (ipcMain) {
      registerHandlers();
    }
  }
};