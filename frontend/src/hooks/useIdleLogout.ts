import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

interface UserSettings {
  idleTimeout: number; // in minutes
  preferredLLM: 'auto' | 'gemini' | 'openai';
  enableIdleLogout: boolean;
  enableLLMFallback: boolean;
}

const useIdleLogout = () => {
  const [settings, setSettings] = useState<UserSettings>({
    idleTimeout: 30,
    preferredLLM: 'auto',
    enableIdleLogout: true,
    enableLLMFallback: true,
  });
  const [isIdle, setIsIdle] = useState(false);
  const [timeUntilLogout, setTimeUntilLogout] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Load settings from localStorage or database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to load from localStorage first
        const storedSettings = localStorage.getItem('userSettings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(parsedSettings);
        }

        // Also try to load from database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data) {
            const dbSettings = {
              idleTimeout: data.idle_timeout || 30,
              preferredLLM: data.preferred_llm || 'auto',
              enableIdleLogout: data.enable_idle_logout !== false,
              enableLLMFallback: data.enable_llm_fallback !== false,
            };
            setSettings(dbSettings);
            localStorage.setItem('userSettings', JSON.stringify(dbSettings));
          }
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    };

    loadSettings();

    // Listen for settings updates
    const handleSettingsUpdate = (event: CustomEvent) => {
      setSettings(event.detail);
    };

    window.addEventListener('userSettingsUpdated', handleSettingsUpdate as EventListener);
    return () => {
      window.removeEventListener('userSettingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, []);

  // Reset timer on user activity
  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    setIsIdle(false);
    setTimeUntilLogout(null);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    if (settings.enableIdleLogout) {
      const timeoutMs = settings.idleTimeout * 60 * 1000;
      
      // Set warning timer (1 minute before logout)
      warningTimerRef.current = setTimeout(() => {
        setIsIdle(true);
        setTimeUntilLogout(60); // 1 minute warning
      }, timeoutMs - 60000);

      // Set logout timer
      timerRef.current = setTimeout(async () => {
        try {
          await supabase.auth.signOut();
          window.location.href = '/login';
        } catch (error) {
          console.error('Error during idle logout:', error);
          window.location.href = '/login';
        }
      }, timeoutMs);
    }
  };

  // Activity event handlers
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timer setup
    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [settings.enableIdleLogout, settings.idleTimeout]);

  // Countdown timer for warning
  useEffect(() => {
    if (!isIdle || timeUntilLogout === null) return;

    const countdown = setInterval(() => {
      setTimeUntilLogout(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdown);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isIdle, timeUntilLogout]);

  // Extend session
  const extendSession = () => {
    resetTimer();
  };

  return {
    isIdle,
    timeUntilLogout,
    settings,
    extendSession,
    resetTimer,
  };
};

export default useIdleLogout; 