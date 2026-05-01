// src/shared/lib/AnalyticsEngine.js

import { get, set } from 'idb-keyval';

class ReliableAnalytics {
  constructor() {
    this.queue = [];
    this.isFlushing = false;
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.flush());
    }
  }

  async track(eventName, payload) {
    const event = { id: crypto.randomUUID ? crypto.randomUUID() : Date.now(), eventName, payload, time: Date.now() };
    this.queue.push(event);
    
    const saved = await get('analytics_queue') || [];
    await set('analytics_queue', [...saved, event]);

    if (navigator.onLine) this.flush();
  }

  async flush() {
    if (this.isFlushing || this.queue.length === 0) return;
    this.isFlushing = true;

    try {
      // Örn: await fetch('/api/track', { method: 'POST', body: JSON.stringify(this.queue) });
      logger.log("[Analytics] Flushed:", this.queue.length, "events");
      this.queue = [];
      await set('analytics_queue', []);
    } catch (e) {
      console.warn("[Analytics] Flush failed, keeping in queue");
    } finally {
      this.isFlushing = false;
    }
  }
}

export const Analytics = new ReliableAnalytics();