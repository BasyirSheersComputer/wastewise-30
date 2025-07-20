// src/services/llmService.ts
import { getBackendUrl } from '../config';

/**
 * Subscribes to the backend analytics and recommendations stream.
 * @param onData - Callback for new data.
 * @param onError - Optional callback for errors.
 * @returns Unsubscribe function.
 */
export function subscribeToAnalytics(
  onData: (data: any) => void,
  onError?: (err: any) => void,
  section: string = 'dashboard'
) {
  console.log('Connecting to analytics stream...');
  const source = new EventSource(`${getBackendUrl('/stream/analytics')}?section=${encodeURIComponent(section)}`);
  
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
