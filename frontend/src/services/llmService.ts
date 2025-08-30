// frontend/services/llmService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AnalyticsData {
  section: string;
  analytics: unknown;
  recommendations: string;
  timestamp: string;
  provider: string;
  error?: string;
}

/**
 * Get recommendations for a specific section (trigger-based, not continuous)
 * @param section The section to get recommendations for
 * @param provider AI provider to use ('auto', 'gemini', 'chatgpt')
 * @returns Promise with recommendation data
 */
export async function getSectionRecommendations(
  section: string, 
  provider: 'auto' | 'gemini' | 'chatgpt' = 'auto'
): Promise<AnalyticsData> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/recommendations/${section}?provider=${provider}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
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
): Promise<AnalyticsData[]> {
  try {
    const sectionsParam = sections.join(',');
    const response = await fetch(
      `${API_BASE_URL}/api/recommendations?sections=${sectionsParam}&provider=${provider}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
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
