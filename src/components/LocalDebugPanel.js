const React = require('react');

const LocalDebugPanel = ({ site, addonSlug }) => {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [debugData, setDebugData] = React.useState({
    errorLogs: [],
    debugLogs: [],
    performanceMetrics: null,
    plugins: [],
    databaseInfo: null
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (site) {
      loadDebugData();
    }
  }, [site]);

  const loadDebugData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load various debug information
      await Promise.all([
        loadErrorLogs(),
        loadDebugLogs(),
        loadPerformanceMetrics(),
        loadPluginInfo(),
        loadDatabaseInfo()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadErrorLogs = async () => {
    try {
      const response = await window.electronAPI.invoke('get-error-logs', site.id);
      setDebugData(prev => ({ ...prev, errorLogs: response.logs || [] }));
    } catch (err) {
      console.error('Failed to load error logs:', err);
    }
  };

  const loadDebugLogs = async () => {
    try {
      const response = await window.electronAPI.invoke('get-debug-logs', site.id);
      setDebugData(prev => ({ ...prev, debugLogs: response.logs || [] }));
    } catch (err) {
      console.error('Failed to load debug logs:', err);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      const response = await window.electronAPI.invoke('get-performance-metrics', site.id);
      setDebugData(prev => ({ ...prev, performanceMetrics: response.metrics }));
    } catch (err) {
      console.error('Failed to load performance metrics:', err);
    }
  };

  const loadPluginInfo = async () => {
    try {
      const response = await window.electronAPI.invoke('analyze-plugins', site.id);
      setDebugData(prev => ({ ...prev, plugins: response.plugins || [] }));
    } catch (err) {
      console.error('Failed to load plugin info:', err);
    }
  };

  const loadDatabaseInfo = async () => {
    try {
      const response = await window.electronAPI.invoke('get-database-info', site.id);
      setDebugData(prev => ({ ...prev, databaseInfo: response }));
    } catch (err) {
      console.error('Failed to load database info:', err);
    }
  };

  const clearLogs = async (logType) => {
    try {
      await window.electronAPI.invoke('clear-logs', site.id, logType);
      if (logType === 'error') {
        setDebugData(prev => ({ ...prev, errorLogs: [] }));
      } else if (logType === 'debug') {
        setDebugData(prev => ({ ...prev, debugLogs: [] }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const renderOverview = () => React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' } },
      React.createElement('div', { style: { padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', textAlign: 'center' } },
        React.createElement('div', { style: { fontSize: '24px', fontWeight: 'bold', color: '#dc2626' } },
          debugData.errorLogs.length
        ),
        React.createElement('p', { style: { margin: '4px 0 0 0', fontSize: '14px', color: '#666' } }, 'Error Logs')
      ),
      React.createElement('div', { style: { padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', textAlign: 'center' } },
        React.createElement('div', { style: { fontSize: '24px', fontWeight: 'bold', color: '#2563eb' } },
          debugData.debugLogs.length
        ),
        React.createElement('p', { style: { margin: '4px 0 0 0', fontSize: '14px', color: '#666' } }, 'Debug Logs')
      ),
      React.createElement('div', { style: { padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', textAlign: 'center' } },
        React.createElement('div', { style: { fontSize: '24px', fontWeight: 'bold', color: '#16a34a' } },
          debugData.plugins.length
        ),
        React.createElement('p', { style: { margin: '4px 0 0 0', fontSize: '14px', color: '#666' } }, 'Plugins')
      )
    )
  );

  const renderErrorLogs = () => React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      React.createElement('h3', { style: { margin: 0, fontSize: '18px', fontWeight: '600' } }, 'Error Logs'),
      React.createElement('button', {
        style: { padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer' },
        onClick: () => clearLogs('error')
      }, 'Clear Logs')
    ),
    debugData.errorLogs.length === 0 ?
      React.createElement('div', { style: { padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' } },
        React.createElement('p', { style: { margin: 0, color: '#6b7280' } }, 'No error logs found for this site.')
      ) :
      React.createElement('div', { style: { maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' } },
        debugData.errorLogs.map((log, index) =>
          React.createElement('div', { key: index, style: { padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('div', { style: { fontSize: '14px', color: '#6b7280', marginBottom: '4px' } }, log.timestamp),
                React.createElement('div', { style: { fontSize: '14px', fontFamily: 'monospace' } }, log.message)
              ),
              React.createElement('span', {
                style: {
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: log.level === 'error' ? '#fef2f2' : log.level === 'warning' ? '#fffbeb' : '#f0f9ff',
                  color: log.level === 'error' ? '#dc2626' : log.level === 'warning' ? '#d97706' : '#2563eb'
                }
              }, log.level)
            )
          )
        )
      )
  );

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' } },
      React.createElement('div', { style: { marginRight: '8px' } }, 'Loading...'),
      React.createElement('div', { style: { width: '20px', height: '20px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' } })
    );
  }

  return React.createElement('div', { style: { padding: '24px' } },
    React.createElement('div', { style: { marginBottom: '24px' } },
      React.createElement('h2', { style: { margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' } }, 'Debug Tools'),
      React.createElement('p', { style: { margin: 0, color: '#6b7280' } }, `Debugging tools for ${site?.name || 'this site'}`)
    ),
    error && React.createElement('div', { style: { padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', marginBottom: '16px' } },
      React.createElement('p', { style: { margin: 0, color: '#dc2626' } }, error)
    ),
    React.createElement('div', { style: { marginBottom: '16px' } },
      React.createElement('div', { style: { display: 'flex', borderBottom: '1px solid #e5e7eb' } },
        ['overview', 'errors', 'debug', 'plugins', 'database'].map((tab) =>
          React.createElement('button', {
            key: tab,
            style: {
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === tab ? '#2563eb' : '#6b7280',
              textTransform: 'capitalize'
            },
            onClick: () => setActiveTab(tab)
          }, tab)
        )
      )
    ),
    React.createElement('div', null,
      activeTab === 'overview' && renderOverview(),
      activeTab === 'errors' && renderErrorLogs()
    ),
    React.createElement('div', { style: { marginTop: '24px', display: 'flex', justifyContent: 'flex-end' } },
      React.createElement('button', {
        style: { padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
        onClick: loadDebugData,
        disabled: loading
      }, loading ? 'Refreshing...' : 'Refresh Data')
    ),
    React.createElement('style', null, `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `)
  );
};

module.exports = LocalDebugPanel;