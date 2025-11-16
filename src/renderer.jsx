const addonID = 'wp-debug-toggler';

// Try ES6 import at top level - webpack externals work best with imports
// We'll use a function wrapper to make it safe
let LocalComponentsModule = null;

// Function to safely get Local Components
// This will be called inside the export function where webpack externals are available
const getLocalComponents = () => {
	if (LocalComponentsModule !== null) {
		return LocalComponentsModule;
	}
	
	// Try multiple ways to access Local Components
	try {
		// Method 1: Try require (webpack external)
		const components = require('@getflywheel/local-components');
		LocalComponentsModule = {
			Toggle: components.Toggle || components.ToggleSwitch || components.Switch,
			Text: components.Text,
			Button: components.Button,
			available: !!(components.Toggle || components.ToggleSwitch || components.Switch) && !!components.Text
		};
		return LocalComponentsModule;
	} catch (e1) {
		// Method 2: Try global/window access
		try {
			if (typeof window !== 'undefined' && window.LocalComponents) {
				const components = window.LocalComponents;
				LocalComponentsModule = {
					Toggle: components.Toggle || components.ToggleSwitch || components.Switch,
					Text: components.Text,
					Button: components.Button,
					available: !!(components.Toggle || components.ToggleSwitch || components.Switch) && !!components.Text
				};
				console.log('WP Debug Toggler: Local Components loaded via window');
				return LocalComponentsModule;
			}
		} catch (e2) {
			// Ignore
		}
		
		// Not available - use fallback
		LocalComponentsModule = { Toggle: null, Text: null, Button: null, available: false };
		return LocalComponentsModule;
	}
};

export default function (context) {
	const { React, hooks, notifier, electron } = context;
	const { useState, useEffect, createElement } = React;
	
	// Make React available for JSX at module scope
	// Babel will transform JSX to React.createElement() calls
	const ReactForJSX = React;

	const TestPanel = (props) => {
		// Get Local Components (lazy-loaded, cached)
		const localComponents = getLocalComponents();
	const ipc = electron.ipcRenderer;
		const site = props.site;
		const [WP_DEBUG, setWP_DEBUG] = useState(false);
		const [WP_DEBUG_LOG, setWP_DEBUG_LOG] = useState(false);
		const [WP_DEBUG_DISPLAY, setWP_DEBUG_DISPLAY] = useState(false);
		const [logContent, setLogContent] = useState('');
		const [logLoading, setLogLoading] = useState(false);

	useEffect(() => {
	  if (!site) return;
			ipc.invoke('wpdebug:getState', { sitePath: site.path })
		.then((res) => {
					setWP_DEBUG(res.WP_DEBUG || false);
					setWP_DEBUG_LOG(res.WP_DEBUG_LOG || false);
					setWP_DEBUG_DISPLAY(res.WP_DEBUG_DISPLAY || false);
				})
				.catch(() => {});
		}, [site]);

		// Load debug log when WP_DEBUG_LOG is enabled
		useEffect(() => {
			if (!site || !WP_DEBUG_LOG) {
				setLogContent('');
				return;
			}
			
			setLogLoading(true);
			const sitePath = site.path || site.rootPath || site.directory;
			if (!sitePath) {
				setLogLoading(false);
				return;
			}
			
			ipc.invoke('wpdebug:readLog', { sitePath: sitePath })
				.then((content) => {
					setLogContent(content || '');
					setLogLoading(false);
				})
				.catch((err) => {
					setLogContent(`Error loading log: ${err.message || 'Unknown error'}`);
					setLogLoading(false);
				});
		}, [site, WP_DEBUG_LOG, ipc]);

		// Function to manually refresh the log
		const loadDebugLog = () => {
			if (!site || !WP_DEBUG_LOG) {
				setLogContent('');
				return;
			}
			
			setLogLoading(true);
			const sitePath = site.path || site.rootPath || site.directory;
			if (!sitePath) {
				setLogLoading(false);
				return;
			}
			
			ipc.invoke('wpdebug:readLog', { sitePath: sitePath })
				.then((content) => {
					setLogContent(content || '');
					setLogLoading(false);
				})
				.catch((err) => {
					setLogContent(`Error loading log: ${err.message || 'Unknown error'}`);
					setLogLoading(false);
				});
		};

		// Open log file in Finder/Explorer
		const openLogFile = () => {
			if (!site) return;
			const sitePath = site.path || site.rootPath || site.directory;
			if (!sitePath) return;
			
			ipc.invoke('wpdebug:openLog', { sitePath: sitePath })
				.catch((err) => {
					notifier.notify({ title: 'WP Debug Error', message: `Failed to open log file: ${err.message || 'Unknown error'}` });
				});
		};

		// Clear the debug log file
		const clearLogFile = () => {
			if (!site) return;
			const sitePath = site.path || site.rootPath || site.directory;
			if (!sitePath) return;
			
			ipc.invoke('wpdebug:clearLog', { sitePath: sitePath })
				.then(() => {
					// Refresh the log display after clearing
					loadDebugLog();
					notifier.notify({ title: 'WP Debug', message: 'Debug log cleared successfully' });
				})
				.catch((err) => {
					notifier.notify({ title: 'WP Debug Error', message: `Failed to clear log file: ${err.message || 'Unknown error'}` });
				});
		};

		const saveState = (newState) => {
	if (!site) {
				notifier.notify({ title: 'WP Debug Error', message: 'Site path not found' });
				return Promise.reject('No site');
			}
			
			const sitePath = site.path || site.rootPath || site.directory;
			
			if (!sitePath) {
				notifier.notify({ title: 'WP Debug Error', message: 'Site path not found' });
				return Promise.reject('No site path');
			}
			
			return ipc.invoke('wpdebug:getState', { sitePath: sitePath })
				.then((currentState) => {
					return ipc.invoke('wpdebug:setState', {
						sitePath: sitePath,
						state: { 
							WP_DEBUG: newState.WP_DEBUG !== undefined ? newState.WP_DEBUG : currentState.WP_DEBUG,
							WP_DEBUG_DISPLAY: newState.WP_DEBUG_DISPLAY !== undefined ? newState.WP_DEBUG_DISPLAY : currentState.WP_DEBUG_DISPLAY,
							WP_DEBUG_LOG: newState.WP_DEBUG_LOG !== undefined ? newState.WP_DEBUG_LOG : currentState.WP_DEBUG_LOG
						}
					});
				})
				.then(() => {
					if (notifier && typeof notifier.notify === 'function') {
						const setting = Object.keys(newState)[0];
						const value = newState[setting];
						notifier.notify({ 
							title: 'WP Debug', 
							message: `${setting} ${value ? 'enabled' : 'disabled'}`
						});
					}
				})
				.catch((err) => {
					console.error('Error saving state:', err);
					notifier.notify({ title: 'WP Debug Error', message: err.message || 'Failed to save' });
				});
		};

		const handleWP_DEBUGChange = (value) => {
			// Handle both Toggle (boolean) and checkbox (event object)
			let checked = false;
			if (typeof value === 'boolean') {
				checked = value;
			} else if (value && typeof value === 'object' && value.target) {
				checked = value.target.checked;
			} else if (value === undefined || value === null) {
				// Toggle might pass undefined, use current state's opposite
				checked = !WP_DEBUG;
			}
			setWP_DEBUG(checked);
			saveState({ WP_DEBUG: checked });
		};

		const handleWP_DEBUG_LOGChange = (value) => {
			// Handle both Toggle (boolean) and checkbox (event object)
			let checked = false;
			if (typeof value === 'boolean') {
				checked = value;
			} else if (value && typeof value === 'object' && value.target) {
				checked = value.target.checked;
			} else if (value === undefined || value === null) {
				checked = !WP_DEBUG_LOG;
			}
			setWP_DEBUG_LOG(checked);
			saveState({ WP_DEBUG_LOG: checked });
		};

		const handleWP_DEBUG_DISPLAYChange = (value) => {
			// Handle both Toggle (boolean) and checkbox (event object)
			let checked = false;
			if (typeof value === 'boolean') {
				checked = value;
			} else if (value && typeof value === 'object' && value.target) {
				checked = value.target.checked;
			} else if (value === undefined || value === null) {
				checked = !WP_DEBUG_DISPLAY;
			}
			setWP_DEBUG_DISPLAY(checked);
			saveState({ WP_DEBUG_DISPLAY: checked });
		};

		// Render toggle or checkbox based on availability
		const renderToggle = (checked, onChange, label, key) => {
			if (localComponents.available && localComponents.Toggle && localComponents.Text) {
				// Use Local Components Toggle
				// Toggle component passes the new checked value (boolean) directly to onChange
				const toggleOnChange = (newValue) => {
					// newValue should be a boolean from Toggle component
					// If undefined, toggle the current state
					const finalValue = typeof newValue === 'boolean' ? newValue : !checked;
					onChange(finalValue);
				};
				
				return ReactForJSX.createElement('div', {
					key: key,
					style: { display: 'flex', alignItems: 'center', gap: 12 }
				}, [
					ReactForJSX.createElement(localComponents.Toggle, {
						key: 'toggle',
						checked: checked,
						onChange: toggleOnChange
					}),
					ReactForJSX.createElement(localComponents.Text, {
						key: 'label',
						style: { marginLeft: 8 }
					}, label)
				]);
			} else {
				// Fall back to checkbox
				return ReactForJSX.createElement('div', {
					key: key,
					style: { display: 'flex', alignItems: 'center', gap: 10 }
				}, [
					ReactForJSX.createElement('label', { key: 'label' }, [
						ReactForJSX.createElement('input', {
							key: 'checkbox',
							type: 'checkbox',
							checked: checked,
							onChange: onChange
						}),
						ReactForJSX.createElement('span', { key: 'text', style: { marginLeft: 8 } }, label)
					])
				]);
			}
		};

		return ReactForJSX.createElement('div', {
			style: { flex: '1', overflowY: 'auto', margin: '10px', padding: '24px' }
		}, [
			ReactForJSX.createElement('h2', { key: 'title' }, 'WP Debug'),
		
			ReactForJSX.createElement('div', {
				key: 'toggles',
				style: { marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }
			}, [
				renderToggle(WP_DEBUG, handleWP_DEBUGChange, 'WP_DEBUG', 'wp-debug'),
				WP_DEBUG ? ReactForJSX.createElement('div', {
					key: 'wp-debug-log-wrapper',
					style: { marginLeft: 20 }
				}, [
					renderToggle(WP_DEBUG_LOG, handleWP_DEBUG_LOGChange, 'WP_DEBUG_LOG', 'wp-debug-log')
				]) : null,
				WP_DEBUG ? ReactForJSX.createElement('div', {
					key: 'wp-debug-display-wrapper',
					style: { marginLeft: 20 }
				}, [
					renderToggle(WP_DEBUG_DISPLAY, handleWP_DEBUG_DISPLAYChange, 'WP_DEBUG_DISPLAY', 'wp-debug-display')
				]) : null,
				// Debug log viewer when WP_DEBUG_LOG is enabled
				WP_DEBUG_LOG ? ReactForJSX.createElement('div', {
					key: 'debug-log-viewer',
					style: { marginTop: 30, marginLeft: 20 }
				}, [
					ReactForJSX.createElement('div', {
						key: 'log-header',
						style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }
					}, [
						localComponents.Text ? ReactForJSX.createElement(localComponents.Text, {
							key: 'log-title',
							style: { fontWeight: 'bold', fontSize: '14px' }
						}, 'Debug Log') : ReactForJSX.createElement('h3', { key: 'log-title', style: { margin: 0, fontSize: '14px' } }, 'Debug Log'),
						ReactForJSX.createElement('div', {
							key: 'log-actions',
							style: { display: 'flex', gap: 8 }
						}, [
							localComponents.Button ? ReactForJSX.createElement(localComponents.Button, {
								key: 'refresh-btn',
								onClick: loadDebugLog,
								disabled: logLoading,
								size: 'small'
							}, logLoading ? 'Loading...' : 'Refresh') : ReactForJSX.createElement('button', {
								key: 'refresh-btn',
								onClick: loadDebugLog,
								disabled: logLoading,
								style: { padding: '6px 12px', fontSize: '12px', cursor: logLoading ? 'not-allowed' : 'pointer' }
							}, logLoading ? 'Loading...' : 'Refresh'),
							localComponents.Button ? ReactForJSX.createElement(localComponents.Button, {
								key: 'clear-btn',
								onClick: clearLogFile,
								size: 'small',
								variant: 'secondary'
							}, 'Clear Log') : ReactForJSX.createElement('button', {
								key: 'clear-btn',
								onClick: clearLogFile,
								style: { padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }
							}, 'Clear Log'),
							localComponents.Button ? ReactForJSX.createElement(localComponents.Button, {
								key: 'open-btn',
								onClick: openLogFile,
								size: 'small',
								variant: 'secondary'
							}, 'Open File') : ReactForJSX.createElement('button', {
								key: 'open-btn',
								onClick: openLogFile,
								style: { padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }
							}, 'Open File')
						])
					]),
					ReactForJSX.createElement('textarea', {
						key: 'log-content',
						readOnly: true,
						value: logContent || (logLoading ? 'Loading...' : 'No log entries yet.'),
						style: {
							width: '100%',
							height: '300px',
							fontFamily: 'monospace',
							fontSize: '12px',
							padding: '12px',
							border: '1px solid #ddd',
							borderRadius: '4px',
							backgroundColor: '#f5f5f5',
							resize: 'vertical',
							overflowY: 'auto',
							whiteSpace: 'pre',
							wordWrap: 'off'
						}
					})
				]) : null
			].filter(Boolean))
		]);
	};

	hooks.addFilter('siteInfoToolsItem', (menu) => [
		...menu,
		{
			menuItem: 'WP Debug',
			path: `/${addonID}`,
			render: (props) => ReactForJSX.createElement(TestPanel, props),
		},
	]);
}
