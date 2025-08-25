// frontend/services/inventorySocket.ts
export function sendInventoryUpdate(data: unknown) {
  // TODO: Implement real socket or API logic
  // For now, just simulate a successful update
  return Promise.resolve({ success: true });
}

export function subscribeToInventoryUpdates(
  onUpdate: (_data: unknown) => void,
  onError: (_error: unknown) => void
) {
  // TODO: Implement real socket subscription
  // Return unsubscribe function
  return () => {
    };
} 