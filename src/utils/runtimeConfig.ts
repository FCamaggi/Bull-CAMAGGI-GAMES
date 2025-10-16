/**
 * Utilidad para cargar configuración en runtime desde runtime-config.json
 * Este archivo es generado durante el build con las variables de entorno.
 */

interface RuntimeConfig {
  VITE_BACKEND_URL: string;
  MODE: string;
  BUILD_TIME: string;
}

let cachedConfig: RuntimeConfig | null = null;
let configPromise: Promise<RuntimeConfig> | null = null;

/**
 * Carga la configuración desde /runtime-config.json
 * Usa caché para evitar múltiples fetches
 */
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  // Si ya tenemos la config en caché, devolverla
  if (cachedConfig) {
    return cachedConfig;
  }

  // Si ya hay una carga en progreso, esperar a que termine
  if (configPromise) {
    return configPromise;
  }

  // Iniciar nueva carga
  configPromise = (async () => {
    try {
      const response = await fetch('/runtime-config.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const config = await response.json();
      cachedConfig = config;
      console.log('✅ Runtime config cargada:', config);
      return config;
    } catch (error) {
      console.warn('⚠️ No se pudo cargar runtime-config.json, usando fallbacks:', error);
      // Fallback a import.meta.env o localhost
      const fallbackConfig: RuntimeConfig = {
        VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
        MODE: import.meta.env.MODE || 'development',
        BUILD_TIME: new Date().toISOString(),
      };
      cachedConfig = fallbackConfig;
      return fallbackConfig;
    } finally {
      configPromise = null;
    }
  })();

  return configPromise;
}

/**
 * Obtiene la URL del backend desde runtime config o fallback
 */
export async function getBackendUrl(): Promise<string> {
  const config = await loadRuntimeConfig();
  return config.VITE_BACKEND_URL;
}

/**
 * Versión síncrona que devuelve la URL si ya está en caché,
 * o el fallback de import.meta.env
 */
export function getBackendUrlSync(): string {
  if (cachedConfig) {
    return cachedConfig.VITE_BACKEND_URL;
  }
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
}
