/**
 * WebSocket Manager (Preview-Only)
 * Manages WebSocket connection for live updates in preview mode
 *
 * IMPORTANT: This should only be imported in preview mode
 */

import { toast } from 'sonner';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface Message {
  type: string;
  data?: any;
  [key: string]: any;
}

export interface SendOptions {
  priority?: 'high' | 'normal' | 'low';
  retry?: boolean;
  deduplicate?: boolean;
}

interface QueuedMessage {
  message: Message;
  options?: SendOptions;
  timestamp: number;
  id: string;
}

export type MessageHandler = (message: any) => void;

/**
 * WebSocketManager - Singleton WebSocket connection manager
 * Handles reconnection, heartbeat, message queuing, and pub/sub
 */
export class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private ws: WebSocket | null = null;
  private appId: string | null = null;
  private messageQueue: QueuedMessage[] = [];
  private subscribers = new Map<string, Set<MessageHandler>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private lastPongTimestamp: number = Date.now();
  private messageIdSet = new Set<string>(); // For deduplication
  private readonly MESSAGE_ID_CACHE_SIZE = 1000;

  private constructor() {
    console.log('[WS] WebSocketManager initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): WebSocketManager {
    if (!this.instance) {
      this.instance = new WebSocketManager();
    }
    return this.instance;
  }

  /**
   * Connect to WebSocket server
   * @param appId - Application ID
   * @param jwtToken - Optional JWT token for authentication (preview mode)
   */
  async connect(appId: string, jwtToken?: string): Promise<void> {
    this.appId = appId;

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL?.replace('http', 'ws');

    if (!wsUrl) {
      console.error('[WS] WebSocket URL not configured. Please set NEXT_PUBLIC_WS_URL or NEXT_PUBLIC_BACKEND_URL');
      throw new Error('WebSocket URL not configured');
    }

    // Use the correct runtime-bridge URL with query parameters
    let fullUrl = `${wsUrl}/ws/runtime-bridge/?type=runtime&app_uuid=${appId}`;
    
    // Add JWT token if provided (for authenticated preview mode)
    if (jwtToken) {
      fullUrl += `&token=${encodeURIComponent(jwtToken)}`;
      console.log('[WS] Connecting with JWT authentication');
    } else {
      console.log('[WS] Connecting without JWT (published mode or missing token)');
    }
    
    // Log URL without exposing the token
    const sanitizedUrl = fullUrl.replace(/token=[^&]+/, 'token=***');
    console.log(`[WS] Attempting connection to: ${sanitizedUrl}`);

    try {
      this.ws = new WebSocket(fullUrl);
    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error);
      throw error;
    }

    this.ws.onopen = () => {
      console.log('[WS] ✅ Connected successfully to', fullUrl);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushQueue();
      this.notifySubscribers('connection', { status: 'connected' });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log(`[WS] Received message:`, message.type);
        
        // Handle pong response for heartbeat
        if (message.type === 'pong') {
          this.lastPongTimestamp = Date.now();
          console.log('[WS] Pong received');
          return;
        }
        
        // Handle message deduplication
        if (message.id && this.messageIdSet.has(message.id)) {
          console.log(`[WS] Duplicate message ignored: ${message.id}`);
          return;
        }
        
        // Add message ID to deduplication set
        if (message.id) {
          this.messageIdSet.add(message.id);

          // Limit cache size
          if (this.messageIdSet.size > this.MESSAGE_ID_CACHE_SIZE) {
            const firstId = this.messageIdSet.values().next().value;
            if (firstId) {
              this.messageIdSet.delete(firstId);
            }
          }
        }
        
        this.notifySubscribers(message.type, message);
        this.notifySubscribers('*', message); // Wildcard subscribers
      } catch (error) {
        console.error('[WS] Failed to parse message:', error);
      }
    };

    this.ws.onerror = (event) => {
      // NOTE: Browser WebSocket error events are typically empty ({}) for security reasons
      // The actual error details will be available in the onclose event below
      // Don't be alarmed by the empty error object - check the logs below for details
      
      const errorContext = {
        readyState: this.ws?.readyState,
        readyStateText: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.ws?.readyState ?? 3],
        url: fullUrl,
        appId: this.appId,
        timestamp: new Date().toISOString(),
      };
      
      console.warn('[WS] ⚠️  WebSocket error event triggered');
      console.info('[WS] Connection context:', errorContext);
      console.info('[WS] 💡 Tip: Check the close event below for actual error details');
      
      this.notifySubscribers('connection', { 
        status: 'error', 
        message: 'WebSocket connection error - check close event for details',
        ...errorContext,
      });
    };

    this.ws.onclose = (event) => {
      console.log('[WS] 🔌 Disconnected', {
        code: event.code,
        reason: event.reason || 'No reason provided',
        wasClean: event.wasClean,
        url: fullUrl,
      });
      
      // Log common close codes for debugging
      const closeReasons: Record<number, string> = {
        1000: 'Normal closure',
        1001: 'Going away (page unload)',
        1002: 'Protocol error',
        1003: 'Unsupported data',
        1006: 'Abnormal closure (no close frame)',
        1007: 'Invalid frame payload',
        1008: 'Policy violation',
        1009: 'Message too big',
        1011: 'Server error',
        1015: 'TLS handshake failure',
      };
      
      if (closeReasons[event.code]) {
        console.log(`[WS] Close reason: ${closeReasons[event.code]} (${event.code})`);
      }
      
      this.stopHeartbeat();
      this.notifySubscribers('connection', { 
        status: 'disconnected',
        code: event.code,
        reason: event.reason || closeReasons[event.code] || 'Unknown',
      });
      
      // Attempt reconnection if not a clean close
      if (this.appId && event.code !== 1000) {
        this.reconnect(this.appId);
      }
    };
  }

  /**
   * Subscribe to messages of a specific type (channel)
   */
  subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(handler);
    console.log(`[WS] Subscribed to channel: ${channel}`);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(channel);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscribers.delete(channel);
        }
        console.log(`[WS] Unsubscribed from channel: ${channel}`);
      }
    };
  }

  /**
   * Send message to server
   * Authentication is handled by JWT at connection level
   */
  async send(message: Message, options?: SendOptions): Promise<void> {
    const { deduplicate = false } = options || {};

    // Generate message ID for deduplication if requested
    let messageId: string | undefined;
    if (deduplicate) {
      messageId = `${message.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      message.id = messageId;
    }

    // Check message size (1MB limit)
    const MAX_MESSAGE_SIZE = 1 * 1024 * 1024; // 1MB
    const messageStr = JSON.stringify(message);
    const messageSize = new Blob([messageStr]).size;

    if (messageSize > MAX_MESSAGE_SIZE) {
      console.error('[WS] Message too large:', { messageSize, MAX_MESSAGE_SIZE });

      toast.error('Content too large to sync', {
        description: `Message size (${Math.round(messageSize / 1024)}KB) exceeds maximum (${Math.round(MAX_MESSAGE_SIZE / 1024)}KB). Please reduce content size.`,
        duration: 10000
      });

      throw new Error(`Message too large: ${messageSize} bytes (max: ${MAX_MESSAGE_SIZE})`);
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(messageStr);
      console.log(`[WS] Sent message: ${message.type}${messageId ? ` (id: ${messageId})` : ''}`);
    } else {
      // Queue message if disconnected
      if (this.messageQueue.length < 100) {
        this.messageQueue.push({
          message,
          options,
          timestamp: Date.now(),
          id: messageId || `queued-${Date.now()}`
        });
        console.log(`[WS] Message queued: ${message.type} (queue size: ${this.messageQueue.length})`);
      } else {
        console.warn('[WS] Message queue full, dropping message');

        // Show user-facing error notification
        toast.error('Connection issue detected', {
          description: 'Message queue is full. Some changes may not be saved. Please check your connection.',
          duration: 10000,
          action: {
            label: 'Dismiss',
            onClick: () => {}
          }
        });
      }
      throw new Error('WebSocket not connected, message queued');
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('[WS] Disconnecting...');
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.appId = null;
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'error';
    }
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Reconnect with exponential backoff
   */
  private reconnect(appId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnection attempts reached');
      this.notifySubscribers('connection', { 
        status: 'error', 
        error: 'Max reconnection attempts reached' 
      });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect(appId);
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing interval
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Check if we received a pong recently
        const timeSinceLastPong = Date.now() - this.lastPongTimestamp;
        
        // If no pong for 90 seconds, consider connection dead
        if (timeSinceLastPong > 90000) {
          console.warn('[WS] No pong received for 90s, reconnecting...');
          this.ws.close();
          return;
        }
        
        // Send ping
        this.send({ type: 'ping' }).catch(() => {
          console.warn('[WS] Heartbeat ping failed');
        });
      }
    }, 30000); // 30 seconds
    
    console.log('[WS] Heartbeat started');
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('[WS] Heartbeat stopped');
    }
  }

  /**
   * Flush queued messages after reconnection
   */
  private flushQueue(): void {
    if (this.messageQueue.length === 0) return;

    console.log(`[WS] Flushing ${this.messageQueue.length} queued messages`);

    let droppedCount = 0;

    while (this.messageQueue.length > 0) {
      const queued = this.messageQueue.shift();
      if (queued) {
        // Remove old messages (older than 60 seconds)
        const MESSAGE_TTL = 60 * 1000; // 60 seconds (reduced from 5 minutes)
        if (Date.now() - queued.timestamp > MESSAGE_TTL) {
          console.warn('[WS] Dropping old queued message:', queued.message.type);
          droppedCount++;
          continue;
        }

        this.send(queued.message, queued.options).catch((error) => {
          console.error('[WS] Failed to send queued message:', error);
        });
      }
    }

    // Show notification if messages were dropped
    if (droppedCount > 0) {
      toast.warning('Stale changes removed', {
        description: `${droppedCount} old ${droppedCount === 1 ? 'message was' : 'messages were'} dropped due to timeout.`,
        duration: 5000
      });
    }
  }

  /**
   * Notify all subscribers of a channel
   */
  private notifySubscribers(channel: string, message: any): void {
    const handlers = this.subscribers.get(channel);
    if (handlers && handlers.size > 0) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error(`[WS] Handler error for channel ${channel}:`, error);
        }
      });
    }
  }

  /**
   * Get debug information
   */
  getDebugInfo(): {
    status: ConnectionStatus;
    queueSize: number;
    subscribers: number;
    reconnectAttempts: number;
  } {
    return {
      status: this.getStatus(),
      queueSize: this.messageQueue.length,
      subscribers: this.subscribers.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

