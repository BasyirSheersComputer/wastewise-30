// src/services/inventorySocket.ts

let socket: WebSocket | null = null;

export function connectInventorySocket(
  onMessage: (data: any) => void,
  onError?: (err: any) => void
) {
  socket = new WebSocket('ws://localhost:4000/inventory');
  socket.onopen = () => {
    console.log('Inventory WebSocket connected');
  };
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      if (onError) onError(e);
    }
  };
  socket.onerror = (err) => {
    if (onError) onError(err);
  };
  socket.onclose = () => {
    console.log('Inventory WebSocket disconnected');
  };
  return () => {
    socket?.close();
  };
}

export function sendInventoryUpdate(data: any) {
  // Placeholder: Implement WebSocket or API call here
  console.log('Inventory update sent:', data);
} 