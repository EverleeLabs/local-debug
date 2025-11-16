# WP Debug Toggler

A Local by WP Engine add-on that allows you to easily toggle WordPress debug settings (`WP_DEBUG`, `WP_DEBUG_LOG`, and `WP_DEBUG_DISPLAY`) directly from the Local Tools tab.

## Features

- ✅ Toggle `WP_DEBUG` on/off
- ✅ Toggle `WP_DEBUG_LOG` (only visible when `WP_DEBUG` is enabled)
- ✅ Toggle `WP_DEBUG_DISPLAY` (only visible when `WP_DEBUG` is enabled)
- ✅ Automatically reads current debug settings from `wp-config.php`
- ✅ Safely updates `wp-config.php` with proper backups
- ✅ Notifications when settings are saved

# Screenshot

<img width="1364" height="1342" alt="image" src="https://github.com/user-attachments/assets/70b46958-c6d0-4cc0-b53e-7fa342c7c0cd" />


## Installation

### Prerequisites

- [Local by WP Engine](https://localwp.com/) installed and running
- Node.js and Yarn (or npm) installed

### Steps

1. **Clone or download this repository** into your Local add-ons directory:

   - **macOS**: `~/Library/Application Support/Local/addons`
   - **Windows**: `C:\Users\username\AppData\Roaming\Local\addons`
   - **Linux**: `~/.config/Local/addons`

   *Note: Replace 'Local' with 'Local Beta' if you're using Local Beta.*

2. **Install dependencies**:
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Build the add-on**:
   ```bash
   yarn build
   # or
   npm run build
   ```

4. **Enable the add-on in Local**:
   - Open Local by WP Engine
   - Go to Settings → Add-ons
   - Find "WP Debug Toggler" and enable it

## Usage

1. Open Local and select a WordPress site
2. Navigate to the **Tools** tab in the site dashboard
3. Click on **"WP Debug"** in the Tools menu
4. Use the checkboxes to toggle debug settings:
   - Check **WP_DEBUG** to enable debug mode
   - When WP_DEBUG is enabled, you'll see two additional options:
     - **WP_DEBUG_LOG**: Logs errors to `wp-content/debug.log`
     - **WP_DEBUG_DISPLAY**: Displays errors on the frontend

## How It Works

The add-on:
- Reads your `wp-config.php` file to detect current debug settings
- Safely updates the debug constants while preserving other configuration
- Creates a backup file (`wp-config.php.wpdebug.bak`) before making changes
- Updates the settings in real-time as you toggle the checkboxes

## Development

### Building for Development

Use the watch mode for automatic rebuilding during development:

```bash
yarn watch
# or
npm run watch
```

### Project Structure

```
wp-debug-toggler/
├── src/
│   ├── main.ts          # Main process (handles wp-config.php operations)
│   └── renderer.jsx     # UI component (Tools tab panel)
├── lib/                 # Compiled output (auto-generated)
├── package.json
├── webpack.config.js
└── tsconfig.json
```

### External Libraries

- `@getflywheel/local-components`: React components for Local add-ons (provided by Local at runtime)
- `@getflywheel/local`: Local add-on API (provided by Local at runtime)

For more information on developing Local add-ons, visit:
- [Local Add-on API Documentation](https://getflywheel.github.io/local-addon-api)
- [Local Components Style Guide](https://getflywheel.github.io/local-components)

## License

MIT

## Author

Everlee Labs
