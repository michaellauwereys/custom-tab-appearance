function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeJavaScript(string) {
  return string.replace(/["\\]/g, '\\$&');
}

function applyRule(rule, tab) {
  const escapedTitle = escapeJavaScript(rule.newTitle);
  browser.tabs.executeScript(tab.id, {
    code: `
      // Set initial title
      document.title = "${escapedTitle}";
      
      // Create observer to watch for title changes
      const titleObserver = new MutationObserver(() => {
        if (document.title !== "${escapedTitle}") {
          document.title = "${escapedTitle}";
        }
      });
      
      // Start observing the title
      titleObserver.observe(
        document.querySelector('title') || document.head || document.documentElement,
        { subtree: true, childList: true, characterData: true }
      );
      
      ${rule.favicon ? `
        // Function to ensure our favicon is set
        function setFavicon() {
          let favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
          if (favicon.href !== "${rule.favicon}") {
            favicon.type = 'image/x-icon';
            favicon.rel = 'shortcut icon';
            favicon.href = "${rule.favicon}";
            document.head.appendChild(favicon);
          }
        }

        // Set initial favicon
        setFavicon();
        
        // Create observer to watch for favicon changes
        const faviconObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList') {
              const icons = document.querySelectorAll("link[rel*='icon']");
              for (const icon of icons) {
                if (icon.href !== "${rule.favicon}") {
                  setFavicon();
                  break;
                }
              }
            }
          }
        });
        
        // Start observing the head for favicon changes
        faviconObserver.observe(document.head, {
          childList: true,
          subtree: true
        });
      ` : ''}
    `
  });
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
          applyRule(rule, tab);
          break;
        }
      }
    });
  }
});

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});
