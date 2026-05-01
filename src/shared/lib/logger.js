// src/shared/lib/logger.js
import * as Sentry from '@sentry/react';

const isProd = import.meta.env.MODE === 'production';

export const logger = {
  log: (...args) => {
    if (!isProd) console.log('[DEV LOG]:', ...args);
  },
  
  warn: (...args) => {
    if (!isProd) console.warn('[DEV WARN]:', ...args);
  },
  
  error: (message, errorInstance = null) => {
    if (!isProd) {
      // 🔥 CRASH FIX: logger.error yerine console.error kullanıldı! (Sonsuz döngü engellendi)
      console.error('[DEV ERROR]:', message, errorInstance || '');
    } else {
      // Production ortamında Sentry'ye logla
      if (errorInstance instanceof Error) {
        Sentry.captureException(errorInstance, { extra: { context: message } });
      } else {
        Sentry.captureException(new Error(message), { extra: { originalData: errorInstance } });
      }
    }
  },

  info: (...args) => {
    if (!isProd) console.info('[DEV INFO]:', ...args);
  }
};