import React, { useState, useEffect } from 'react';
import Icons from './Icons';
import { DebugLogger } from '../utils/DebugLogger';

const DebugLogModal = ({ onClose }) => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        setLogs(DebugLogger.getLogs());
    }, []);

    const handleCopy = () => {
        const text = logs.join('\n');
        navigator.clipboard.writeText(text).then(() => {
            alert("Log copied to clipboard!");
        });
    };

    const handleClear = () => {
        if (confirm("Clear all logs?")) {
            DebugLogger.clear();
            setLogs([]);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                    <h2>Debug Event Log</h2>
                    <button className="btn-icon" onClick={onClose}><Icons.X /></button>
                </div>

                <div style={{ flex: 1, overflow: 'auto', background: '#2c3e50', padding: '10px', borderRadius: '4px', margin: '10px 0', border: '1px solid #34495e' }}>
                    <pre style={{
                        fontFamily: 'Consolas, monospace',
                        fontSize: '11px',
                        color: '#ecf0f1',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        margin: 0
                    }}>
                        {logs.length > 0 ? logs.join('\n') : "No logs found."}
                    </pre>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <button className="btn" onClick={handleClear} style={{ backgroundColor: '#c0392b', borderColor: '#e74c3c' }}>
                        <Icons.Trash style={{ marginRight: '5px' }} /> Clear
                    </button>
                    <button className="btn" onClick={handleCopy} style={{ backgroundColor: '#27ae60', borderColor: '#2ecc71' }}>
                        Copy to Clipboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DebugLogModal;
