const addonID = 'wp-debug-toggler';

// Cache for Local Components
let LocalComponentsCache = null;

// Function to get Local Components - try require at runtime
// This avoids breaking module load if components aren't available
const getLocalComponents = () => {
	if (LocalComponentsCache !== null) {
		console.log('WP Debug Toggler: getLocalComponents() - returning cached result:', LocalComponentsCache);
		return LocalComponentsCache;
	}
	
	console.log('WP Debug Toggler: getLocalComponents() called - cache is null, attempting to load');
	
	// Try multiple methods to get Local Components
	// Method 1: Try require (webpack external)
	let components = null;
	let error = null;
	
	try {
		console.log('WP Debug Toggler: Method 1 - Trying require("@getflywheel/local-components")');
		components = require('@getflywheel/local-components');
		console.log('WP Debug Toggler: require() succeeded, type:', typeof components, 'value:', components);
	} catch (e) {
		error = e;
		console.error('WP Debug Toggler: require() failed:', e.message);
	}
	
	// Method 2: Try accessing through global/window if require failed
	if (!components && typeof window !== 'undefined') {
		try {
			console.log('WP Debug Toggler: Method 2 - Checking window.LocalComponents');
			if (window.LocalComponents) {
				components = window.LocalComponents;
				console.log('WP Debug Toggler: Found via window.LocalComponents');
			}
		} catch (e) {
			console.warn('WP Debug Toggler: window check failed:', e.message);
		}
	}
	
	// Method 3: Try accessing through process or global if in Node context
	if (!components && typeof process !== 'undefined') {
		try {
			console.log('WP Debug Toggler: Method 3 - Checking global scope');
			if (global.LocalComponents) {
				components = global.LocalComponents;
				console.log('WP Debug Toggler: Found via global.LocalComponents');
			}
		} catch (e) {
			console.warn('WP Debug Toggler: global check failed:', e.message);
		}
	}
	
	// Method 4: Try using eval to bypass webpack's require handling
	if (!components || Object.keys(components).length === 0) {
		try {
			console.log('WP Debug Toggler: Method 4 - Trying eval require (bypass webpack)');
			const evalRequire = eval('require');
			const evalComponents = evalRequire('@getflywheel/local-components');
			if (evalComponents && Object.keys(evalComponents).length > 0) {
				components = evalComponents;
				console.log('WP Debug Toggler: eval require succeeded with', Object.keys(evalComponents).length, 'keys');
			} else {
				console.warn('WP Debug Toggler: eval require returned empty object');
			}
		} catch (e) {
			console.warn('WP Debug Toggler: eval require failed:', e.message);
		}
	}
	
	// Method 5: Try accessing through React's context if available
	// This will be checked in the component since we need context there
	
	// Process the components if we found them
	if (components && typeof components === 'object' && components !== null) {
		console.log('WP Debug Toggler: Components found! Keys:', Object.keys(components).slice(0, 20));
		
		const toggle = components.Toggle || components.ToggleSwitch || components.Switch;
		const text = components.Text;
		const button = components.Button;
		
		console.log('WP Debug Toggler: Extracted - Toggle:', !!toggle, 'Text:', !!text, 'Button:', !!button);
		
		if (toggle && text) {
			LocalComponentsCache = {
				Toggle: toggle,
				Text: text,
				Button: button,
				available: true
			};
			console.log('WP Debug Toggler: ✅ Local Components loaded successfully!');
			return LocalComponentsCache;
		} else {
			console.warn('WP Debug Toggler: Components found but Toggle or Text missing');
		}
	} else {
		console.warn('WP Debug Toggler: No components found. require() returned:', components, 'Error:', error?.message);
	}
	
	// Not available - use fallback
	console.warn('WP Debug Toggler: Using fallback UI (checkboxes and native buttons)');
	LocalComponentsCache = { Toggle: null, Text: null, Button: null, available: false };
	return LocalComponentsCache;
};

export default function (context) {
	const { React, hooks, notifier, electron } = context;
	const { useState, useEffect, createElement } = React;
	
	// Make React available for JSX at module scope
	// Babel will transform JSX to React.createElement() calls
	const ReactForJSX = React;
	const createEl = createElement; // Alias to avoid conflicts

	// Try to get Local Components at module level (before component definition)
	// This might work better than inside the component
	let moduleLevelComponents = null;
	try {
		console.log('WP Debug Toggler: Trying to load Local Components at module level...');
		const modComponents = require('@getflywheel/local-components');
		if (modComponents && typeof modComponents === 'object') {
			const toggle = modComponents.Toggle || modComponents.ToggleSwitch || modComponents.Switch;
			const text = modComponents.Text;
			if (toggle && text) {
				moduleLevelComponents = {
					Toggle: toggle,
					Text: text,
					Button: modComponents.Button,
					available: true
				};
				console.log('WP Debug Toggler: ✅ Local Components loaded at module level!');
			}
		}
	} catch (e) {
		console.warn('WP Debug Toggler: Module level require failed:', e.message);
	}

	const TestPanel = (props) => {
		// Get Local Components - try multiple methods
		let localComponents = moduleLevelComponents; // Start with module-level attempt
		
		// Debug: Log what's available in context
		console.log('WP Debug Toggler: Context keys:', Object.keys(context));
		
		// Check all context properties for Local Components
		console.log('WP Debug Toggler: Checking all context properties...');
		for (const key in context) {
			const value = context[key];
			console.log(`WP Debug Toggler: context.${key}:`, typeof value);
			if (value && typeof value === 'object') {
				const keys = Object.keys(value).slice(0, 20);
				if (keys.length > 0) {
					console.log(`WP Debug Toggler: context.${key} keys:`, keys);
				}
				// Check if this object has Toggle, Text, or Button
				if (value.Toggle || value.Text || value.Button || value.ToggleSwitch || value.Switch) {
					console.log(`WP Debug Toggler: ⚠️ Found potential Local Components in context.${key}!`);
					console.log(`WP Debug Toggler: Toggle:`, !!value.Toggle, 'Text:', !!value.Text, 'Button:', !!value.Button);
				}
			}
		}
		
		// Check if React has Local Components attached
		if (React && typeof React === 'object') {
			console.log('WP Debug Toggler: Checking React for Local Components...');
			const reactKeys = Object.keys(React).slice(0, 30);
			console.log('WP Debug Toggler: React keys:', reactKeys);
			if (React.LocalComponents || React.Components) {
				console.log('WP Debug Toggler: ⚠️ Found Local Components on React!');
			}
		}
		
		// Check document/window for Local Components
		if (typeof document !== 'undefined') {
			console.log('WP Debug Toggler: Checking document/window for Local Components...');
			if (document.LocalComponents || (typeof window !== 'undefined' && window.LocalComponents)) {
				console.log('WP Debug Toggler: ⚠️ Found Local Components on document/window!');
			}
		}
		
		// Method 1: Try from context.components (if Local provides it)
		if (!localComponents && context.components) {
			const ctxComponents = context.components;
			if (ctxComponents && (ctxComponents.Toggle || ctxComponents.ToggleSwitch || ctxComponents.Switch || ctxComponents.Text)) {
				localComponents = {
					Toggle: ctxComponents.Toggle || ctxComponents.ToggleSwitch || ctxComponents.Switch,
					Text: ctxComponents.Text,
					Button: ctxComponents.Button,
					available: !!(ctxComponents.Toggle || ctxComponents.ToggleSwitch || ctxComponents.Switch) && !!ctxComponents.Text
				};
				console.log('WP Debug Toggler: ✅ Local Components loaded from context.components!');
			}
		}
		
		// Method 2: Try require (webpack external) - clear cache first to force retry
		if (!localComponents || !localComponents.available) {
			console.log('WP Debug Toggler: Attempting to load via require (clearing cache)...');
			LocalComponentsCache = null; // Clear cache to force retry
			localComponents = getLocalComponents();
			console.log('WP Debug Toggler: Result from getLocalComponents:', localComponents);
		}
		
		// Store localComponents in a const to avoid reassignment issues
		const components = localComponents;
		console.log('WP Debug Toggler: components const set to:', components);
		
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
			if (components && components.available && components.Toggle && components.Text) {
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
					ReactForJSX.createElement(components.Toggle, {
						key: 'toggle',
						checked: checked,
						onChange: toggleOnChange
					}),
					ReactForJSX.createElement(components.Text, {
						key: 'label',
						style: { marginLeft: 8 }
					}, label)
				]);
		} else {
			// Use styled toggle switch fallback - inline to avoid function reference issues
			const handleToggleClick = () => {
				const newValue = !checked;
				if (typeof onChange === 'function') {
					onChange(newValue);
				}
			};
			
			return ReactForJSX.createElement('div', {
				key: key,
				style: { 
					display: 'flex', 
					alignItems: 'center', 
					gap: 12,
					cursor: 'pointer',
					userSelect: 'none'
				},
				onClick: handleToggleClick
			}, [
				ReactForJSX.createElement('div', {
					key: 'toggle-track',
					style: {
						position: 'relative',
						width: 40,
						height: 20,
						backgroundColor: checked ? '#267048' : '#D0D0D0',
						borderRadius: 10,
						transition: 'background-color 0.2s ease',
						flexShrink: 0
					}
				}, [
					ReactForJSX.createElement('div', {
						key: 'toggle-thumb',
						style: {
							position: 'absolute',
							top: 2,
							left: checked ? 20 : 2,
							width: 16,
							height: 16,
							backgroundColor: '#fff',
							borderRadius: '50%',
							transition: 'left 0.2s ease',
							boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
						}
					})
				]),
				ReactForJSX.createElement('span', {
					key: 'label',
					style: {
						fontSize: '14px',
						color: '#2C3338',
						fontWeight: 400,
						lineHeight: '20px'
					}
				}, label)
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
						components && components.Text ? ReactForJSX.createElement(components.Text, {
							key: 'log-title',
							style: { fontWeight: 'bold', fontSize: '14px' }
						}, 'Debug Log') : ReactForJSX.createElement('h3', { key: 'log-title', style: { margin: 0, fontSize: '14px' } }, 'Debug Log'),
						ReactForJSX.createElement('div', {
							key: 'log-actions',
							style: { display: 'flex', gap: 8 }
						}, [
						components && components.Button ? ReactForJSX.createElement(components.Button, {
							key: 'refresh-btn',
							onClick: loadDebugLog,
							disabled: logLoading,
							size: 'small'
						}, logLoading ? 'Loading...' : 'Refresh') : ReactForJSX.createElement('button', {
							key: 'refresh-btn',
							onClick: loadDebugLog,
							disabled: logLoading,
							type: 'button',
							style: {
								padding: '6px 12px',
								fontSize: '13px',
								fontWeight: '500',
								cursor: logLoading ? 'not-allowed' : 'pointer',
								border: '2px solid #267048',
								backgroundColor: 'transparent',
								color: '#267048',
								borderRadius: '50px',
								transition: 'all 0.2s ease',
								opacity: logLoading ? 0.6 : 1,
								outline: 'none',
								fontFamily: 'inherit',
								fontWeight: '700'
							},
							onMouseEnter: (e) => {
								if (!logLoading) {
									e.target.style.backgroundColor = '#51bb7b';
									e.target.style.color = '#fff';
									e.target.style.border = 'none';
								}
							},
							onMouseLeave: (e) => {
								if (!logLoading) {
									e.target.style.backgroundColor = 'transparent';
									e.target.style.color = '#267048';
									e.target.style.border = '2px solid #267048';
								}
							}
						}, logLoading ? 'Loading...' : 'Refresh'),
						components && components.Button ? ReactForJSX.createElement(components.Button, {
							key: 'clear-btn',
							onClick: clearLogFile,
							size: 'small',
							variant: 'secondary'
						}, 'Clear Log') : ReactForJSX.createElement('button', {
							key: 'clear-btn',
							onClick: clearLogFile,
							type: 'button',
							style: {
								padding: '6px 12px',
								fontSize: '13px',
								fontWeight: '700',
								cursor: 'pointer',
								border: '2px solid #267048',
								backgroundColor: 'transparent',
								color: '#267048',
								borderRadius: '50px',
								transition: 'all 0.2s ease',
								outline: 'none',
								fontFamily: 'inherit'
							},
							onMouseEnter: (e) => {
								e.target.style.backgroundColor = '#51bb7b';
								e.target.style.color = '#fff';
								e.target.style.border = 'none';
							},
							onMouseLeave: (e) => {
								e.target.style.backgroundColor = 'transparent';
								e.target.style.color = '#267048';
									e.target.style.border = '2px solid #267048';
							}
						}, 'Clear Log'),
						components && components.Button ? ReactForJSX.createElement(components.Button, {
							key: 'open-btn',
							onClick: openLogFile,
							size: 'small',
							variant: 'secondary'
						}, 'Open File') : ReactForJSX.createElement('button', {
							key: 'open-btn',
							onClick: openLogFile,
							type: 'button',
							style: {
								padding: '6px 12px',
								fontSize: '13px',
								fontWeight: '700',
								cursor: 'pointer',
								border: '2px solid #267048',
								backgroundColor: 'transparent',
								color: '#267048',
								borderRadius: '50px',
								transition: 'all 0.2s ease',
								outline: 'none',
								fontFamily: 'inherit'
							},
							onMouseEnter: (e) => {
								e.target.style.backgroundColor = '#51bb7b';
								e.target.style.color = '#fff';
								e.target.style.border = 'none';
							},
							onMouseLeave: (e) => {
								e.target.style.backgroundColor = 'transparent';
								e.target.style.color = '#267048';
									e.target.style.border = '2px solid #267048';
							}
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
