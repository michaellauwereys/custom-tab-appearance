function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeJavaScript(string) {
  return string.replace(/["\\]/g, '\\$&');
}

// This function will be injected into the page
function injectScript(title, favicon) {
  // Set initial title
  document.title = title;
  
  // Create observer to watch for title changes
  const titleObserver = new MutationObserver(() => {
    if (document.title !== title) {
      document.title = title;
    }
  });
  
  // Start observing the title
  titleObserver.observe(
    document.querySelector('title') || document.head || document.documentElement,
    { subtree: true, childList: true, characterData: true }
  );
  
  if (favicon) {
    // Function to ensure our favicon is set
    function setFavicon() {
      let favicon_elem = document.querySelector("link[rel*='icon']") || document.createElement('link');
      if (favicon_elem.href !== favicon) {
        favicon_elem.type = 'image/x-icon';
        favicon_elem.rel = 'shortcut icon';
        favicon_elem.href = favicon;
        document.head.appendChild(favicon_elem);
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
            if (icon.href !== favicon) {
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
  }
}

function applyRule(rule, tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: injectScript,
    args: [rule.newTitle, rule.favicon]
  });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get('rules', function(data) {
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

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
}); 