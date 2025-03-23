import { store } from '../store';
import { addTrade, updatePosition } from '../store/slices/tradingSlice';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;

  connect() {
    const token = store.getState().auth.token;
    if (!token) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
    this.ws = new WebSocket(`${wsUrl}?token=${token}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.subscribe();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleDisconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'trade':
        store.dispatch(addTrade(data.data));
        break;
      case 'position_update':
        store.dispatch(updatePosition(data.data));
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  private handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectTimeout * this.reconnectAttempts);
    }
  }

  private subscribe() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const symbol = store.getState().trading.selectedSymbol;
      if (symbol) {
        this.ws.send(JSON.stringify({
          type: 'subscribe',
          symbol,
        }));
      }
    }
  }

  unsubscribe() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const symbol = store.getState().trading.selectedSymbol;
      if (symbol) {
        this.ws.send(JSON.stringify({
          type: 'unsubscribe',
          symbol,
        }));
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketService = new WebSocketService(); 