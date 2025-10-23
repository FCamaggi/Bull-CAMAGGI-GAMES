#!/usr/bin/env node

/**
 * Script para generar runtime-config.json con variables de entorno
 * Se ejecuta durante el build para inyectar configuración en tiempo de compilación
 * que luego es accesible en runtime por el navegador.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Leer variables de entorno
const config = {
    VITE_BACKEND_URL: process.env.VITE_BACKEND_URL || 'http://localhost:3001',
    MODE: process.env.NODE_ENV || 'development',
    BUILD_TIME: new Date().toISOString(),
};

// Ruta de salida: frontend/public/runtime-config.json
const outputPath = join(__dirname, '..', 'public', 'runtime-config.json');

try {
    // Asegurar que el directorio existe
    mkdirSync(dirname(outputPath), { recursive: true });

    // Escribir configuración
    writeFileSync(outputPath, JSON.stringify(config, null, 2), 'utf-8');

    console.log('✅ runtime-config.json generado exitosamente');
    console.log('📦 Configuración:', config);
} catch (error) {
    console.error('❌ Error generando runtime-config.json:', error);
    process.exit(1);
}
