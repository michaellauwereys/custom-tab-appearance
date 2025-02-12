function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeJavaScript(string) {
  return string.replace(/["\\]/g, '\\$&');
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    browser.storage.local.get('rules', function(data) {
      const rules = data.rules || [];
      
      for (const rule of rules) {
        if (rule.disabled) continue;
        
        let matches = false;
        
        switch (rule.matchType) {
          case 'domain':
            // Create URL object to properly parse domain
            try {
              const url = new URL(tab.url);
              const domain = url.hostname;
              matches = domain.includes(rule.pattern);
            } catch (e) {
              console.error('Invalid URL:', tab.url);
            }
            break;
          case 'title':
            matches = tab.title.includes(rule.pattern);
            break;
          case 'regex':
            try {
              const regex = new RegExp(rule.pattern);
              matches = regex.test(tab.title) || regex.test(tab.url);
            } catch (e) {
              console.error('Invalid regex pattern:', rule.pattern);
            }
            break;
        }

        if (matches) {
          const escapedTitle = escapeJavaScript(rule.newTitle);
          browser.tabs.executeScript(tabId, {
            code: `
              document.title = "${escapedTitle}";
              ${rule.favicon ? `
                let favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
                favicon.type = 'image/x-icon';
                favicon.rel = 'shortcut icon';
                favicon.href = "${rule.favicon}";
                document.head.appendChild(favicon);
              ` : ''}
            `
          });
          break;
        }
      }
    });
  }
});

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});
