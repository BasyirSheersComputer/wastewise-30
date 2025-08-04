import React, { useState, useEffect } from 'react';
import { Settings, Clock, Zap, Database, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface UserSettings {
  idleTimeout: number; // in minutes
  preferredLLM: 'auto' | 'gemini' | 'openai';
  enableIdleLogout: boolean;
  enableLLMFallback: boolean;
}

const UserSettings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    idleTimeout: 30,
    preferredLLM: 'auto',
    enableIdleLogout: true,
    enableLLMFallback: true,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        setSettings({
          idleTimeout: data.idle_timeout || 30,
          preferredLLM: data.preferred_llm || 'auto',
          enableIdleLogout: data.enable_idle_logout !== false,
          enableLLMFallback: data.enable_llm_fallback !== false,
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          idle_timeout: settings.idleTimeout,
          preferred_llm: settings.preferredLLM,
          enable_idle_logout: settings.enableIdleLogout,
          enable_llm_fallback: settings.enableLLMFallback,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        setError('Failed to save settings');
        console.error('Error saving settings:', error);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // Update global settings
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Trigger settings update event
      window.dispatchEvent(new CustomEvent('userSettingsUpdated', { detail: settings }));
    } catch (error) {
      setError('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">User Settings</h3>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Idle Logout Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">Idle Logout</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Enable idle logout</label>
              <input
                type="checkbox"
                checked={settings.enableIdleLogout}
                onChange={(e) => handleSettingChange('enableIdleLogout', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            {settings.enableIdleLogout && (
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Idle timeout (minutes)</label>
                <select
                  value={settings.idleTimeout}
                  onChange={(e) => handleSettingChange('idleTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={240}>4 hours</option>
                </select>
                <p className="text-xs text-gray-500">
                  You will be automatically logged out after {settings.idleTimeout} minutes of inactivity
                </p>
              </div>
            )}
          </div>
        </div>

        {/* LLM Provider Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">AI Recommendations</h4>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Preferred AI Provider</label>
              <select
                value={settings.preferredLLM}
                onChange={(e) => handleSettingChange('preferredLLM', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Auto (Best Available)</option>
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI ChatGPT</option>
              </select>
              <p className="text-xs text-gray-500">
                Choose your preferred AI provider for recommendations
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Enable automatic fallback</label>
              <input
                type="checkbox"
                checked={settings.enableLLMFallback}
                onChange={(e) => handleSettingChange('enableLLMFallback', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            {settings.enableLLMFallback && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">Automatic Fallback Enabled</p>
                    <p>If your preferred AI provider reaches quota limits, the system will automatically switch to the next available provider.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <Save className="w-4 h-4" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettings; 