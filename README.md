# Local Debug Add-on

A Local by Flywheel add-on that provides enhanced debugging tools for WordPress development.

## Features

- **Error Log Viewer**: View and analyze WordPress error logs
- **Debug Log Viewer**: View WordPress debug logs with timestamps
- **Performance Monitor**: Monitor site performance metrics
- **Plugin Analyzer**: Analyze plugin performance and conflicts
- **Database Explorer**: Browse and query the WordPress database

## Installation

1. Copy this add-on folder to your Local by Flywheel add-ons directory:
   - **Windows**: `%APPDATA%\Local\addons\`
   - **macOS**: `~/Library/Application Support/Local/addons/`
   - **Linux**: `~/.config/Local/addons/`

2. Restart Local by Flywheel

3. The "Debug" panel will appear in the Tools tab for each site

## Usage

1. Open any site in Local by Flywheel
2. Go to the **Tools** tab
3. Click on the **Debug** panel
4. Use the different tabs to access various debugging tools:
   - **Overview**: Quick summary of debug information
   - **Error Logs**: View and clear error logs
   - **Debug Logs**: View and clear debug logs
   - **Plugins**: Analyze installed plugins
   - **Database**: Database information and query tools

## Development

This add-on uses Local's Content Hooks system to inject a React component into the Tools tab using the `siteInfoToolsItem` filter.

### Key Files

- `index.js` - Main add-on entry point with content hooks registration
- `src/components/LocalDebugPanel.jsx` - React component for the Debug panel
- `package.json` - Add-on metadata and dependencies
- `local-addon.json` - Local-specific add-on configuration

### Content Hooks Used

- `siteInfoToolsItem` - Adds the Debug panel to each site's Tools tab
- IPC handlers for communication between the React component and the main process

## Requirements

- Local by Flywheel 6.0.0 or higher
- Node.js 12.0.0 or higher

## License

MIT