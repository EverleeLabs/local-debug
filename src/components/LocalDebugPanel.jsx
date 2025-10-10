import React, { useState, useEffect } from 'react';

const LocalDebugPanel = ({ site, addonSlug }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [debugData, setDebugData] = useState({
    errorLogs: [],
    debugLogs: [],
    performanceMetrics: null,
    plugins: [],
    databaseInfo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {debugData.errorLogs.length}
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>Error Logs</p>
        </div>
        
        <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
            {debugData.debugLogs.length}
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>Debug Logs</p>
        </div>
        
        <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
            {debugData.plugins.length}
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>Plugins</p>
        </div>
      </div>

      {debugData.performanceMetrics && (
        <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Performance Metrics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Page Load Time:</span>
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: '4px', 
                backgroundColor: debugData.performanceMetrics.pageLoadTime > 2 ? '#fef2f2' : '#f0f9ff',
                color: debugData.performanceMetrics.pageLoadTime > 2 ? '#dc2626' : '#2563eb'
              }}>
                {debugData.performanceMetrics.pageLoadTime.toFixed(2)}s
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Memory Usage:</span>
              <span>{(debugData.performanceMetrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderErrorLogs = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Error Logs</h3>
        <button 
          style={{ 
            padding: '8px 16px', 
            border: '1px solid #d1d5db', 
            borderRadius: '6px', 
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
          onClick={() => clearLogs('error')}
        >
          Clear Logs
        </button>
      </div>
      
      {debugData.errorLogs.length === 0 ? (
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
          <p style={{ margin: 0, color: '#6b7280' }}>No error logs found for this site.</p>
        </div>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {debugData.errorLogs.map((log, index) => (
            <div key={index} style={{ padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                    {log.timestamp}
                  </div>
                  <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                    {log.message}
                  </div>
                </div>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  backgroundColor: log.level === 'error' ? '#fef2f2' : log.level === 'warning' ? '#fffbeb' : '#f0f9ff',
                  color: log.level === 'error' ? '#dc2626' : log.level === 'warning' ? '#d97706' : '#2563eb'
                }}>
                  {log.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDebugLogs = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Debug Logs</h3>
        <button 
          style={{ 
            padding: '8px 16px', 
            border: '1px solid #d1d5db', 
            borderRadius: '6px', 
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
          onClick={() => clearLogs('debug')}
        >
          Clear Logs
        </button>
      </div>
      
      {debugData.debugLogs.length === 0 ? (
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
          <p style={{ margin: 0, color: '#6b7280' }}>No debug logs found for this site.</p>
        </div>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {debugData.debugLogs.map((log, index) => (
            <div key={index} style={{ padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                {log.timestamp}
              </div>
              <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                {log.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPlugins = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Plugin Analysis</h3>
      
      {debugData.plugins.length === 0 ? (
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
          <p style={{ margin: 0, color: '#6b7280' }}>No plugins found for this site.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {debugData.plugins.map((plugin, index) => (
            <div key={index} style={{ padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{plugin.name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{plugin.path}</div>
                </div>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  backgroundColor: plugin.active ? '#f0f9ff' : '#f9fafb',
                  color: plugin.active ? '#2563eb' : '#6b7280'
                }}>
                  {plugin.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDatabase = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Database Explorer</h3>
      
      {debugData.databaseInfo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Database Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Database Name:</span>
                <span style={{ fontFamily: 'monospace' }}>{debugData.databaseInfo.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tables:</span>
                <span>{debugData.databaseInfo.tableCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Size:</span>
                <span>{debugData.databaseInfo.size}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
          <p style={{ margin: 0, color: '#6b7280' }}>Database information not available.</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ marginRight: '8px' }}>Loading...</div>
        <div style={{ width: '20px', height: '20px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>Debug Tools</h2>
        <p style={{ margin: 0, color: '#6b7280' }}>Debugging tools for {site?.name || 'this site'}</p>
      </div>

      {error && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          <p style={{ margin: 0, color: '#dc2626' }}>{error}</p>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {['overview', 'errors', 'debug', 'plugins', 'database'].map((tab) => (
            <button
              key={tab}
              style={{
                padding: '12px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === tab ? '#2563eb' : '#6b7280',
                textTransform: 'capitalize'
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'errors' && renderErrorLogs()}
        {activeTab === 'debug' && renderDebugLogs()}
        {activeTab === 'plugins' && renderPlugins()}
        {activeTab === 'database' && renderDatabase()}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
          onClick={loadDebugData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LocalDebugPanel;