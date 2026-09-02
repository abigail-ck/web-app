/* ---------------------------------------------------------
   Data layer — IndexedDB for photos, localStorage for config.

   Data model
   ----------
   config (localStorage "jdr:config")
     { v, eventTitle, welcome, heroWord, origin, namePrompt, endsAt(ISO), createdAt(ISO) }
   user (localStorage "jdr:user")
     { name }
   photo (IndexedDB store "photos", keyPath "id")
     { id, blob(Blob JPEG), author, style, note, createdAt(ISO), demo(bool), width, height }
   --------------------------------------------------------- */
(function (global) {
  const DB_NAME = 'jardin-de-recuerdos';
  const DB_VERSION = 1;
  const STORE = 'photos';
  let dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('author', 'author');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  function tx(mode, fn) {
    return open().then((db) => new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const store = t.objectStore(STORE);
      let result;
      try { result = fn(store); } catch (e) { reject(e); return; }
      t.oncomplete = () => resolve(result && result.result !== undefined ? result.result : result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }));
  }

  const photos = {
    all() {
      return tx('readonly', (s) => s.getAll()).then((list) =>
        (list || []).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
    },
    add(photo) { return tx('readwrite', (s) => s.put(photo)).then(() => photo); },
    remove(id) { return tx('readwrite', (s) => s.delete(id)); },
    removeWhere(pred) {
      return photos.all().then((list) => tx('readwrite', (s) => {
        list.filter(pred).forEach((p) => s.delete(p.id));
      }));
    },
    clear() { return tx('readwrite', (s) => s.clear()); },
  };

  const KEY_CONFIG = 'jdr:config';
  const KEY_USER = 'jdr:user';

  function read(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* quota / private mode */ }
  }

  const config = {
    defaults() {
      const now = new Date();
      // Default event window: ends 1 day 23 hours from first launch.
      const ends = new Date(now.getTime() + (24 + 23) * 3600 * 1000);
      return {
        v: 2,
        eventTitle: 'La boda de Emma y Daniel',
        welcome: 'Bienvenido al Jardín de los Recuerdos.',
        heroWord: 'JARDÍN',
        origin: 'FR.1983',
        namePrompt: 'Escribe tu nombre para el cuaderno del evento:',
        endsAt: ends.toISOString(),
        createdAt: now.toISOString(),
      };
    },
    get() {
      const stored = read(KEY_CONFIG, null);
      if (stored && stored.v === 2) return Object.assign(config.defaults(), stored);
      if (stored) {
        // Older (pre-Spanish) config: keep the event window, refresh the texts.
        const migrated = Object.assign(config.defaults(), { endsAt: stored.endsAt, createdAt: stored.createdAt });
        write(KEY_CONFIG, migrated);
        return migrated;
      }
      const d = config.defaults();
      write(KEY_CONFIG, d);
      return d;
    },
    set(patch) { const next = Object.assign(config.get(), patch); write(KEY_CONFIG, next); return next; },
    reset() { localStorage.removeItem(KEY_CONFIG); },
  };

  const user = {
    get() { return read(KEY_USER, null); },
    set(name) { const u = { name }; write(KEY_USER, u); return u; },
    clear() { localStorage.removeItem(KEY_USER); },
  };

  global.JDR = global.JDR || {};
  global.JDR.db = { photos, config, user };
})(window);
