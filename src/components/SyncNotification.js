import React, { useContext, useEffect, useState } from 'react';
import { WorkspaceContext } from '../providers/workspaceProvider';
import "./SyncNotification.scss";

const SyncNotification = () => {
  const { syncMessage, clearSyncMessage } = useContext(WorkspaceContext);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (syncMessage) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(clearSyncMessage, 500); // Clear after fade animation
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [syncMessage, clearSyncMessage]);
  
  if (!syncMessage) return null;
  
  return (
    <div className={`sync-notification ${syncMessage.type} ${visible ? 'visible' : ''}`}>
      <div className="notification-content">
        <span className="material-icons">
          {syncMessage.type === 'success' ? 'check_circle' : 
           syncMessage.type === 'warning' ? 'warning' : 'info'}
        </span>
        <p>{syncMessage.text}</p>
      </div>
      <button onClick={() => setVisible(false)} className="close-btn">
        <span className="material-icons">close</span>
      </button>
    </div>
  );
};

export default SyncNotification;