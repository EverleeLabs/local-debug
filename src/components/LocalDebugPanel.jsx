import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  Tabs,
  Tab,
  Alert,
  Spinner,
  Badge
} from '@local/components';

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

  const executeQuery = async (query) => {
    try {
      const response = await window.electronAPI.invoke('execute-db-query', site.id, query);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {debugData.errorLogs.length}
            </div>
            <p className="text-sm text-gray-600">Error Logs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {debugData.debugLogs.length}
            </div>
            <p className="text-sm text-gray-600">Debug Logs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {debugData.plugins.length}
            </div>
            <p className="text-sm text-gray-600">Plugins</p>
          </CardContent>
        </Card>
      </div>

      {debugData.performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Page Load Time:</span>
                <Badge variant={debugData.performanceMetrics.pageLoadTime > 2 ? 'destructive' : 'default'}>
                  {debugData.performanceMetrics.pageLoadTime.toFixed(2)}s
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Memory Usage:</span>
                <span>{(debugData.performanceMetrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderErrorLogs = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Error Logs</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => clearLogs('error')}
        >
          Clear Logs
        </Button>
      </div>
      
      {debugData.errorLogs.length === 0 ? (
        <Alert>
          <p>No error logs found for this site.</p>
        </Alert>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {debugData.errorLogs.map((log, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">
                    {log.timestamp}
                  </div>
                  <div className="text-sm font-mono">
                    {log.message}
                  </div>
                </div>
                <Badge 
                  variant={log.level === 'error' ? 'destructive' : log.level === 'warning' ? 'secondary' : 'default'}
                >
                  {log.level}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDebugLogs = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Debug Logs</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => clearLogs('debug')}
        >
          Clear Logs
        </Button>
      </div>
      
      {debugData.debugLogs.length === 0 ? (
        <Alert>
          <p>No debug logs found for this site.</p>
        </Alert>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {debugData.debugLogs.map((log, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded border">
              <div className="text-sm text-gray-600 mb-1">
                {log.timestamp}
              </div>
              <div className="text-sm font-mono">
                {log.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPlugins = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Plugin Analysis</h3>
      
      {debugData.plugins.length === 0 ? (
        <Alert>
          <p>No plugins found for this site.</p>
        </Alert>
      ) : (
        <div className="space-y-2">
          {debugData.plugins.map((plugin, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded border">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{plugin.name}</div>
                  <div className="text-sm text-gray-600">{plugin.path}</div>
                </div>
                <Badge variant={plugin.active ? 'default' : 'secondary'}>
                  {plugin.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDatabase = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Database Explorer</h3>
      
      {debugData.databaseInfo ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Database Name:</span>
                  <span className="font-mono">{debugData.databaseInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tables:</span>
                  <span>{debugData.databaseInfo.tableCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{debugData.databaseInfo.size}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert>
          <p>Database information not available.</p>
        </Alert>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
        <span className="ml-2">Loading debug data...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Debug Tools</h2>
        <p className="text-gray-600">Debugging tools for {site?.name || 'this site'}</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <p>{error}</p>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex space-x-1 mb-4">
          <Tab value="overview">Overview</Tab>
          <Tab value="errors">Error Logs</Tab>
          <Tab value="debug">Debug Logs</Tab>
          <Tab value="plugins">Plugins</Tab>
          <Tab value="database">Database</Tab>
        </div>

        <div className="mt-4">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'errors' && renderErrorLogs()}
          {activeTab === 'debug' && renderDebugLogs()}
          {activeTab === 'plugins' && renderPlugins()}
          {activeTab === 'database' && renderDatabase()}
        </div>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={loadDebugData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
    </div>
  );
};

export default LocalDebugPanel;