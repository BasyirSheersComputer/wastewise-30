export function subscribeToAnalytics(onData: (data: any) => void, onError?: (err: any) => void) {
  const source = new EventSource('http://localhost:4000/stream/analytics');
  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onData(data);
    } catch (e) {
      if (onError) onError(e);
    }
  };
  source.onerror = (err) => {
    if (onError) onError(err);
    source.close();
  };
  return () => source.close();
}
