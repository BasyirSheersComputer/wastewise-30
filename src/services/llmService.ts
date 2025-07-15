// src/services/llmService.ts

/**
 * Subscribes to the backend analytics and recommendations stream.
 * @param onData - Callback for new data.
 * @param onError - Optional callback for errors.
 * @returns Unsubscribe function.
 */
export function subscribeToAnalytics(
  onData: (data: any) => void,
  onError?: (err: any) => void
) {
  console.log('Connecting to analytics stream...');
  const source = new EventSource('http://localhost:4000/stream/analytics');
  
  source.onopen = () => {
    console.log('EventSource connection opened');
  };
  
  source.onmessage = (event) => {
    console.log('Received message from server:', event.data);
    try {
      const data = JSON.parse(event.data);
      console.log('Parsed data:', data);
      onData(data);
    } catch (e) {
      console.error('Error parsing message:', e);
      if (onError) onError(e);
    }
  };
  
  source.onerror = (err) => {
    console.error('EventSource error:', err);
    if (onError) onError(err);
    source.close();
  };
  
  return () => {
    console.log('Closing EventSource connection');
    source.close();
  };
}
