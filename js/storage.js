const ChildStore = {
  _key: 'story711_children',
  _load() { return JSON.parse(localStorage.getItem(this._key) || '[]'); },
  _save(arr) { localStorage.setItem(this._key, JSON.stringify(arr)); },
  getAll() { return this._load(); },
  get(id) { return this._load().find(c => c.id === id) || null; },
  add(child) {
    const arr = this._load();
    child.id = generateId();
    child.createdAt = Date.now();
    child.updatedAt = Date.now();
    arr.push(child);
    this._save(arr);
    if (arr.length === 1) Settings.setDefaultChild(child.id);
    return child;
  },
  update(id, data) {
    const arr = this._load();
    const i = arr.findIndex(c => c.id === id);
    if (i === -1) return null;
    Object.assign(arr[i], data, { updatedAt: Date.now() });
    this._save(arr);
    return arr[i];
  },
  remove(id) {
    let arr = this._load();
    arr = arr.filter(c => c.id !== id);
    this._save(arr);
    if (Settings.getDefaultChild() === id) {
      Settings.setDefaultChild(arr.length ? arr[0].id : null);
    }
  },
  getDefault() {
    const id = Settings.getDefaultChild();
    return id ? this.get(id) : (this.getAll()[0] || null);
  }
};

const StoryStore = {
  _key: 'story711_stories',
  _load() { return JSON.parse(localStorage.getItem(this._key) || '[]'); },
  _save(arr) { localStorage.setItem(this._key, JSON.stringify(arr)); },
  getAll() { return this._load(); },
  get(id) { return this._load().find(s => s.id === id) || null; },
  add(story) {
    const arr = this._load();
    story.id = generateId();
    story.createdAt = Date.now();
    story.updatedAt = Date.now();
    arr.push(story);
    this._save(arr);
    return story;
  },
  update(id, data) {
    const arr = this._load();
    const i = arr.findIndex(s => s.id === id);
    if (i === -1) return null;
    Object.assign(arr[i], data, { updatedAt: Date.now() });
    this._save(arr);
    return arr[i];
  },
  remove(id) {
    let arr = this._load();
    arr = arr.filter(s => s.id !== id);
    this._save(arr);
  },
  getFavorites() { return this._load().filter(s => s.favorite); },
  getRecent(limit = 5) {
    return this._load().filter(s => s.lastPlayedAt).sort((a, b) => b.lastPlayedAt - a.lastPlayedAt).slice(0, limit);
  },
  addToHistory(info) {
    const arr = this._load();
    let existing = arr.find(s => s.originalId === info.originalId);
    if (existing) {
      existing.lastPlayedAt = Date.now();
      existing.listenCount = (existing.listenCount || 0) + 1;
    } else {
      arr.push({ id: generateId(), originalId: info.originalId, title: info.title, emoji: info.emoji || '📖', category: info.category, favorite: false, listenCount: 1, lastPlayedAt: Date.now(), createdAt: Date.now() });
    }
    this._save(arr);
  },
  setFavorite(originalId, fav) {
    const arr = this._load();
    let existing = arr.find(s => s.originalId === originalId);
    if (existing) { existing.favorite = fav; this._save(arr); }
  },
  getHistory(limit = 10) {
    return this._load().filter(s => s.lastPlayedAt).sort((a, b) => b.lastPlayedAt - a.lastPlayedAt).slice(0, limit);
  }
};

const Settings = {
  _key: 'story711_settings',
  _load() { return JSON.parse(localStorage.getItem(this._key) || '{}'); },
  _save(obj) { localStorage.setItem(this._key, JSON.stringify(obj)); },
  get(key) { return this._load()[key]; },
  set(key, value) { const o = this._load(); o[key] = value; this._save(o); },
  getDefaultChild() { return this._load().defaultChild || null; },
  setDefaultChild(id) { this.set('defaultChild', id); }
};
