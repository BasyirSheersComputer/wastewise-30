// frontend/services/llmService.ts

interface AnalyticsData {
  section: string;
  analytics: any;
  recommendations: string;
  timestamp: string;
  provider: string;
  error?: string;
}

interface RecommendationResponse {
  section: string;
  analytics: any;
  recommendations: string;
  timestamp: string;
  provider: string;
  error?: string;
}

/**
 * Subscribe to real-time analytics stream with database-driven recommendations
 * @param onData Callback for successful data
 * @param onError Callback for errors
 * @param section The section to get recommendations for
 * @returns Unsubscribe function
 */
export function subscribeToAnalytics(
  onData: (data: AnalyticsData) => void,
  onError: (error: any) => void,
  section: string
) {
  const eventSource = new EventSource(`http://localhost:3000/stream/analytics?section=${section}`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onData(data);
    } catch (error) {
      onError(error);
    }
  };
  
  eventSource.onerror = (error) => {
    onError(error);
  };
  
  // Return unsubscribe function
  return () => {
    eventSource.close();
  };
}

/**
 * Get recommendations for a specific section
 * @param section The section to get recommendations for
 * @param provider AI provider to use ('auto', 'gemini', 'chatgpt')
 * @returns Promise with recommendation data
 */
export async function getSectionRecommendations(
  section: string, 
  provider: 'auto' | 'gemini' | 'chatgpt' = 'auto'
): Promise<RecommendationResponse> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recommendations/${section}?provider=${provider}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return {
      section,
      analytics: {},
      recommendations: 'Unable to fetch recommendations at this time.',
      timestamp: new Date().toISOString(),
      provider: 'none',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get recommendations for multiple sections
 * @param sections Array of sections to get recommendations for
 * @param provider AI provider to use
 * @returns Promise with recommendations for all sections
 */
export async function getMultiSectionRecommendations(
  sections: string[],
  provider: 'auto' | 'gemini' | 'chatgpt' = 'auto'
): Promise<RecommendationResponse[]> {
  try {
    const sectionsParam = sections.join(',');
    const response = await fetch(
      `http://localhost:3000/api/recommendations?sections=${sectionsParam}&provider=${provider}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching multi-section recommendations:', error);
    return sections.map(section => ({
      section,
      analytics: {},
      recommendations: 'Unable to fetch recommendations at this time.',
      timestamp: new Date().toISOString(),
      provider: 'none',
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getSectionRecommendations instead
 */
export async function getRecommendations(section: string): Promise<string> {
  try {
    const result = await getSectionRecommendations(section);
    return result.recommendations;
  } catch (error) {
    return 'Unable to get recommendations at this time.';
  }
}
