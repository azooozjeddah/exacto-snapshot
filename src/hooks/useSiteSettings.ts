import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SettingsMap {
  [key: string]: { value_ar: string; value_en: string };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({ data }) => {
      const map: SettingsMap = {};
      data?.forEach((r) => { map[r.setting_key] = { value_ar: r.value_ar || '', value_en: r.value_en || '' }; });
      setSettings(map);
      setLoading(false);
    });
  }, []);

  const get = (key: string, lang: 'ar' | 'en' = 'ar') =>
    lang === 'ar' ? settings[key]?.value_ar || '' : settings[key]?.value_en || '';

  return { settings, loading, get };
}
