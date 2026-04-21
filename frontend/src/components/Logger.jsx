import React from "react";

// Simple logging component for debugging
export const Logger = ({ logs = [] }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '8px 12px',
          background: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        📋 Logs
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '400px',
      height: '300px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      borderRadius: '8px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>🔍 Debug Logs</span>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
      <div style={{
        flex: 1,
        padding: '8px',
        overflowY: 'auto',
        fontSize: '11px'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#666' }}>No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{
              marginBottom: '4px',
              padding: '2px 0',
              borderBottom: '1px solid #222'
            }}>
              <span style={{ color: '#888' }}>
                {new Date().toLocaleTimeString()}:
              </span>
              <span style={{ marginLeft: '8px' }}>{log}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Logger;