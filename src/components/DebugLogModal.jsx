import React, { useState, useEffect } from 'react';
import Icons from './Icons';
import UnifiedModal from './layout/UnifiedModal';
import UnifiedButton from './common/UnifiedButton';
import { DebugLogger } from '../utils/DebugLogger';

const DebugLogModal = ({ onClose }) => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        setLogs(DebugLogger.getLogs());
    }, []);

    const handleCopy = () => {
        const text = logs.join('\n');
        navigator.clipboard.writeText(text).then(() => {
            alert("Full log copied to clipboard!");
        });
    };

    const handleCopySession = () => {
        // Find the index of the start of the session (App Mounted)
        let startIndex = logs.findIndex(line => line.includes('[APP] App Mounted'));

        // If we found 'App Mounted', check if the NEXT line is an Account Reset.
        // Because Account Reset saves -> reloads -> App Mounts.
        // So chronologically Reset is just before Mount (but in standard logs it's "older", so higher index).
        // If we want to include "Account Reset" as part of this session's history:
        if (startIndex !== -1) {
            if (logs[startIndex + 1] && logs[startIndex + 1].includes('[ADMIN] Account Reset')) {
                startIndex++;
            }
        } else {
            // Fallback: If no App Mounted found (weird), maybe just look for Reset?
            // Or just copy everything? Let's default to everything if we can't find a start.
            // Or search for Reset as primary?
            // User said: "always from starting the app".
            // If we can't find start, we assume full log is the session.
        }

        // logs[0] is the NEWEST log. So we want from 0 to startIndex (inclusive).
        let sessionLogs = [];
        if (startIndex === -1) {
            sessionLogs = logs;
        } else {
            sessionLogs = logs.slice(0, startIndex + 1);
        }

        const text = sessionLogs.join('\n');
        navigator.clipboard.writeText(text).then(() => {
            alert("Session log copied to clipboard!");
        });
    };

    const handleClear = () => {
        if (confirm("Clear all logs?")) {
            DebugLogger.clear();
            setLogs([]);
        }
    };

    return (
        <UnifiedModal isOpen={true} onClose={onClose} title="Debug Event Log">
            <div style={{ flex: 1, overflow: 'auto', background: '#2c3e50', padding: '10px', borderRadius: '4px', margin: '10px 0', border: '1px solid #34495e', maxHeight: '400px' }}>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', gap: '10px' }}>
                <UnifiedButton variant="danger" onClick={handleClear} icon={<Icons.Trash />}>
                    Clear
                </UnifiedButton>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <UnifiedButton variant="primary" onClick={handleCopySession}>
                        Copy Session
                    </UnifiedButton>
                    <UnifiedButton variant="primary" onClick={handleCopy}>
                        Copy All
                    </UnifiedButton>
                </div>
            </div>
        </UnifiedModal>
    );
};

export default DebugLogModal;
