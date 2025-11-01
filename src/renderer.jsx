const addonID = 'wp-debug-toggler';

export default function (context) {
	const { React, hooks, notifier, electron } = context;
	const { useState, useEffect, createElement } = React;
	
	// Make React available for JSX at module scope
	// Babel will transform JSX to React.createElement() calls
	const ReactForJSX = React;

	const TestPanel = (props) => {
		const ipc = electron.ipcRenderer;
		const site = props.site;
		const [WP_DEBUG, setWP_DEBUG] = useState(false);
		const [WP_DEBUG_LOG, setWP_DEBUG_LOG] = useState(false);
		const [WP_DEBUG_DISPLAY, setWP_DEBUG_DISPLAY] = useState(false);

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

		const handleWP_DEBUGChange = (e) => {
			const checked = e.target.checked;
			setWP_DEBUG(checked);
			saveState({ WP_DEBUG: checked });
		};

		const handleWP_DEBUG_LOGChange = (e) => {
			const checked = e.target.checked;
			setWP_DEBUG_LOG(checked);
			saveState({ WP_DEBUG_LOG: checked });
		};

		const handleWP_DEBUG_DISPLAYChange = (e) => {
			const checked = e.target.checked;
			setWP_DEBUG_DISPLAY(checked);
			saveState({ WP_DEBUG_DISPLAY: checked });
		};

		return ReactForJSX.createElement('div', {
			style: { flex: '1', overflowY: 'auto', margin: '10px', padding: '24px' }
		}, [
			ReactForJSX.createElement('h2', { key: 'title' }, 'WP Debug'),
		
			ReactForJSX.createElement('div', {
				key: 'toggles',
				style: { marginTop: 20, display: 'flex', flexDirection: 'column', gap: 15 }
			}, [
				ReactForJSX.createElement('div', {
					key: 'wp-debug',
					style: { display: 'flex', alignItems: 'center', gap: 10 }
				}, [
					ReactForJSX.createElement('label', { key: 'label' }, [
						ReactForJSX.createElement('input', {
							key: 'checkbox',
							type: 'checkbox',
							checked: WP_DEBUG,
							onChange: handleWP_DEBUGChange
						}),
						ReactForJSX.createElement('span', { key: 'text', style: { marginLeft: 8 } }, 'WP_DEBUG')
					])
				]),
				WP_DEBUG ? ReactForJSX.createElement('div', {
					key: 'wp-debug-log',
					style: { display: 'flex', alignItems: 'center', gap: 10, marginLeft: 20 }
				}, [
					ReactForJSX.createElement('label', { key: 'label' }, [
						ReactForJSX.createElement('input', {
							key: 'checkbox',
							type: 'checkbox',
							checked: WP_DEBUG_LOG,
							onChange: handleWP_DEBUG_LOGChange
						}),
						ReactForJSX.createElement('span', { key: 'text', style: { marginLeft: 8 } }, 'WP_DEBUG_LOG')
					])
				]) : null,
				WP_DEBUG ? ReactForJSX.createElement('div', {
					key: 'wp-debug-display',
					style: { display: 'flex', alignItems: 'center', gap: 10, marginLeft: 20 }
				}, [
					ReactForJSX.createElement('label', { key: 'label' }, [
						ReactForJSX.createElement('input', {
							key: 'checkbox',
							type: 'checkbox',
							checked: WP_DEBUG_DISPLAY,
							onChange: handleWP_DEBUG_DISPLAYChange
						}),
						ReactForJSX.createElement('span', { key: 'text', style: { marginLeft: 8 } }, 'WP_DEBUG_DISPLAY')
					])
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
