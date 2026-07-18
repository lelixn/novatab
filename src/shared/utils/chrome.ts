

const isChromeExtension = (): boolean =>
  typeof chrome !== 'undefined' && !!chrome?.storage?.local;

export const chromeStorage = {
  get: async <T>(key: string): Promise<T | null> => {
    if (isChromeExtension()) {
      const result = await chrome.storage.local.get(key);
      return (result[key] as T) ?? null;
    }
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    if (isChromeExtension()) {
      await chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  remove: async (key: string): Promise<void> => {
    if (isChromeExtension()) {
      await chrome.storage.local.remove(key);
    } else {
      localStorage.removeItem(key);
    }
  },

  clear: async (): Promise<void> => {
    if (isChromeExtension()) {
      await chrome.storage.local.clear();
    } else {
      localStorage.clear();
    }
  },
};

// Chrome Notifications
export const chromeNotify = (title: string, message: string, iconUrl = '/icons/icon48.png') => {
  if (isChromeExtension() && chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl,
      title,
      message,
      priority: 2,
    });
  }
};

// Chrome Alarms
export const chromeAlarm = {
  create: (name: string, delayInMinutes: number) => {
    if (isChromeExtension() && chrome.alarms) {
      chrome.alarms.create(name, { delayInMinutes });
    }
  },
  clear: (name: string) => {
    if (isChromeExtension() && chrome.alarms) {
      chrome.alarms.clear(name);
    }
  },
};
