// NOVA://OS — Chrome Extension Service Worker
// Manifest V3 Background Script

// ============================================
// Alarm Listener (Pomodoro)
// ============================================
chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
  if (alarm.name === 'pomodoro-complete') {
    chrome.notifications.create('pomodoro-done', {
      type: 'basic',
      iconUrl: '/icons/icon48.png',
      title: 'NOVA://OS — Pomodoro',
      message: '🎯 Session complete! Time for a break.',
      priority: 2,
    });
  }

  if (alarm.name === 'break-complete') {
    chrome.notifications.create('break-done', {
      type: 'basic',
      iconUrl: '/icons/icon48.png',
      title: 'NOVA://OS — Break Over',
      message: '⚡ Break complete! Ready to focus?',
      priority: 2,
    });
  }
});

// ============================================
// Command Listener (Keyboard Shortcuts)
// ============================================
chrome.commands.onCommand.addListener((command: string) => {
  if (command === 'open-search') {
    // Open the new tab (NOVA://OS) if not already open
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      const currentTab = tabs[0];
      if (currentTab?.url?.includes('chrome://newtab')) {
        // Already on newtab, send message to open search
        chrome.tabs.sendMessage(currentTab.id!, { type: 'OPEN_SEARCH' });
      } else {
        chrome.tabs.create({ url: 'chrome://newtab' });
      }
    });
  }
});

// ============================================
// Install / Update Handler
// ============================================
chrome.runtime.onInstalled.addListener(({ reason }: { reason: chrome.runtime.OnInstalledReason }) => {
  if (reason === 'install') {
    chrome.notifications.create('nova-welcome', {
      type: 'basic',
      iconUrl: '/icons/icon48.png',
      title: 'Welcome to NOVA://OS',
      message: '🚀 Your developer cockpit is ready. Open a new tab to get started!',
      priority: 2,
    });
  }
});

// ============================================
// Message Handler
// ============================================
chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === 'CREATE_ALARM') {
    chrome.alarms.create(message.name, { delayInMinutes: message.delayInMinutes });
    sendResponse({ success: true });
  }
  if (message.type === 'CLEAR_ALARM') {
    chrome.alarms.clear(message.name);
    sendResponse({ success: true });
  }
  return true;
});
