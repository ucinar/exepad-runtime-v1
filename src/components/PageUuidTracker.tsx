"use client";

import { useEffect, useRef } from 'react';
import { useEditMode } from '../context/EditModeContext';

interface PageUuidTrackerProps {
  pageUuid: string;
  appId: string;
}

/**
 * Client component that tracks page UUID changes and sends them to the parent window
 * via postMessage (for immediate availability) and WebSocket (when connected)
 */
export const PageUuidTracker: React.FC<PageUuidTrackerProps> = ({ pageUuid, appId }) => {
  const { sendWebSocketMessage, wsConnectionStatus } = useEditMode();
  const lastSentPageUuid = useRef<string | null>(null);

  useEffect(() => {
    // Always send via postMessage to parent window for immediate availability
    // This works regardless of WebSocket connection status
    if (pageUuid && lastSentPageUuid.current !== pageUuid) {
      console.log('Sending page UUID to parent via postMessage:', pageUuid);
      try {
        window.parent.postMessage({
          type: 'page_changed',
          pageUuid: pageUuid,
          appId: appId,
          source: 'leapdo-runtime'
        }, '*');
        console.log('Successfully sent page UUID via postMessage');
      } catch (error) {
        console.error('Failed to send postMessage:', error);
      }
      
      // Also send via WebSocket if connected (for edit mode features)
      if (wsConnectionStatus === 'connected') {
        console.log('Also sending via WebSocket');
        sendWebSocketMessage({
          type: 'page_changed',
          data: {
            pageUuid: pageUuid,
            appId: appId
          }
        });
      }
      
      lastSentPageUuid.current = pageUuid;
    }
  }, [pageUuid, appId, wsConnectionStatus, sendWebSocketMessage]);

  // This component doesn't render anything
  return null;
};

