const DEFAULT_EMOJIS = [
  { emoji: '🌐', name: 'Globe' },
  { emoji: '⭕', name: 'Red Circle' },
  { emoji: '⚪', name: 'White Circle' },
  { emoji: '⚫', name: 'Black Circle' },
  { emoji: '⭐', name: 'Star' },
  { emoji: '🔥', name: 'Fire' },
  { emoji: '💡', name: 'Bulb' },
  { emoji: '🎯', name: 'Target' },
  { emoji: '🎨', name: 'Art' },
  { emoji: '📚', name: 'Books' },
  { emoji: '🔍', name: 'Search' },
  { emoji: '🏠', name: 'Home' },
  { emoji: '⚡', name: 'Lightning' },
  { emoji: '🎮', name: 'Game' },
  { emoji: '🎵', name: 'Music' },
  { emoji: '📱', name: 'Mobile' },
  { emoji: '💻', name: 'Laptop' },
  { emoji: '🔒', name: 'Lock' },
  { emoji: '❤️', name: 'Heart' },
  { emoji: '✨', name: 'Sparkles' },
  { emoji: '🎬', name: 'Movie' },
  { emoji: '📺', name: 'TV' },
  { emoji: '🎪', name: 'Circus' },
  { emoji: '🎭', name: 'Theater' },
  { emoji: '🎲', name: 'Game Die' },
  { emoji: '🌟', name: 'Glowing Star' },
  { emoji: '💠', name: 'Diamond' },
  { emoji: '🔰', name: 'Beginner' },
  { emoji: '⚜️', name: 'Fleur-de-lis' }
];

function emojiToFaviconData(emoji) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 16, 16);
  return canvas.toDataURL('image/png');
}

document.addEventListener('DOMContentLoaded', function() {
  loadRules();

  document.getElementById('addRule').addEventListener('click', addNewRule);
  document.getElementById('exportRules').addEventListener('click', exportRules);
  document.querySelector('.import-button').addEventListener('click', () => {
    document.getElementById('importRules').click();
  });
  document.getElementById('importRules').addEventListener('change', importRules);
  document.getElementById('removeAllRules').addEventListener('click', removeAllRules);

  // Add collapsible functionality
  const collapsible = document.querySelector('.collapsible');
  collapsible.addEventListener('click', function() {
    this.classList.toggle('active');
  });

  // Handle emoji selection preview
  const emojiGrid = document.querySelector('.emoji-grid');
  
  // Create custom upload option first
  const customDiv = document.createElement('div');
  customDiv.className = 'emoji-item custom-upload';
  const plusSpan = document.createElement('span');
  plusSpan.style.fontSize = '20px';
  plusSpan.textContent = '➕';
  customDiv.appendChild(plusSpan);
  customDiv.appendChild(document.createElement('br'));
  const smallText = document.createElement('small');
  smallText.textContent = 'Import';
  customDiv.appendChild(smallText);
  customDiv.addEventListener('click', () => {
    document.getElementById('faviconUpload').click();
  });
  emojiGrid.appendChild(customDiv);
  
  DEFAULT_EMOJIS.forEach(({ emoji, name }) => {
    const div = document.createElement('div');
    div.className = 'emoji-item';
    // Add emoji
    const emojiSpan = document.createElement('span');
    emojiSpan.textContent = emoji;
    div.appendChild(emojiSpan);
    
    // Add line break
    div.appendChild(document.createElement('br'));
    
    // Add name in small text
    const nameSpan = document.createElement('small');
    nameSpan.textContent = name;
    div.appendChild(nameSpan);
    
    div.addEventListener('click', () => {
      document.querySelectorAll('.emoji-item').forEach(item => item.classList.remove('selected'));
      div.classList.add('selected');
      document.getElementById('addRule').dataset.selectedEmoji = emoji;
    });
    emojiGrid.appendChild(div);
  });

  // Handle custom upload selection and preview
  document.getElementById('faviconUpload').addEventListener('change', function(e) {
    if (this.files.length > 0) {
      // Remove selection from all items and select custom upload
      document.querySelectorAll('.emoji-item').forEach(item => item.classList.remove('selected'));
      document.querySelector('.custom-upload').classList.add('selected');
      delete document.getElementById('addRule').dataset.selectedEmoji;
      
      // Preview the uploaded image in the custom upload box
      const reader = new FileReader();
      reader.onload = function(e) {
        const customBox = document.querySelector('.custom-upload');
        customBox.textContent = ''; // Clear existing content
        
        // Create and add the image
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '24px';
        img.style.height = '24px';
        customBox.appendChild(img);
        
        // Add line break
        customBox.appendChild(document.createElement('br'));
        
        // Add "Import" label
        const importLabel = document.createElement('small');
        importLabel.textContent = 'Import';
        customBox.appendChild(importLabel);
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
});

function showAlert(message, title = 'Notice') {
  const modal = document.getElementById('alertModal');
  const messageEl = document.getElementById('alertMessage');
  const titleEl = document.getElementById('alertTitle');
  
  titleEl.textContent = title;
  messageEl.textContent = message;
  modal.style.display = 'block';

  document.getElementById('alertOk').onclick = function() {
    modal.style.display = 'none';
  };

  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

function addNewRule() {
  const matchType = document.getElementById('matchType').value;
  const pattern = document.getElementById('pattern').value;
  const newTitle = document.getElementById('newTitle').value;
  const faviconInput = document.getElementById('faviconUpload');
  const addButton = document.getElementById('addRule');
  
  if (!pattern || !newTitle) {
    showAlert('Please fill in all fields', 'Missing Information');
    return;
  }

  const processRule = (faviconData = null) => {
    const rule = {
      matchType,
      pattern,
      newTitle,
      id: addButton.dataset.editId ? parseInt(addButton.dataset.editId) : Date.now(),
      disabled: addButton.dataset.editId ? (addButton.dataset.disabled === 'true') : false
    };

    // Handle emoji favicon
    if (addButton.dataset.selectedEmoji) {
      rule.favicon = emojiToFaviconData(addButton.dataset.selectedEmoji);
    } else if (addButton.dataset.editId && !faviconData && addButton.dataset.existingFavicon) {
      rule.favicon = addButton.dataset.existingFavicon;
    } else if (faviconData) {
      rule.favicon = faviconData;
    }

    chrome.storage.local.get('rules', function(data) {
      let rules = data.rules || [];
      if (addButton.dataset.editId) {
        // Update existing rule
        rules = rules.map(r => r.id === parseInt(addButton.dataset.editId) ? rule : r);
      } else {
        // Add new rule
        rules.push(rule);
      }
      
      chrome.storage.local.set({ rules }, function() {
        loadRules();
        clearInputs();
        cancelEdit();
      });
    });
  };

  if (faviconInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function(e) {
      processRule(e.target.result);
    };
    reader.readAsDataURL(faviconInput.files[0]);
  } else {
    processRule();
  }
}

function loadRules() {
  const enabledRulesContainer = document.getElementById('enabledRules');
  const disabledRulesContainer = document.getElementById('disabledRules');
  
  chrome.storage.local.get('rules', function(data) {
    const rules = data.rules || [];
    enabledRulesContainer.innerHTML = '';
    disabledRulesContainer.innerHTML = '';
    
    rules.forEach(rule => {
      const ruleElement = document.createElement('div');
      ruleElement.className = 'rule-item' + (rule.disabled ? ' disabled' : '');
      
      // Create rule content container
      const ruleContent = document.createElement('div');
      ruleContent.className = 'rule-content';
      // Create a mapping for display names
      const typeDisplayNames = {
        'domain': 'Domain',
        'title': 'Title',
        'regex': 'RegEx'
      };
      const typeLabel = document.createElement('strong');
      typeLabel.textContent = `${typeDisplayNames[rule.matchType]}:`;
      ruleContent.appendChild(typeLabel);
      ruleContent.appendChild(document.createTextNode(` ${rule.pattern}`));
      ruleContent.appendChild(document.createElement('br'));

      const newTitleLabel = document.createElement('strong');
      newTitleLabel.textContent = 'New Title:';
      ruleContent.appendChild(newTitleLabel);
      ruleContent.appendChild(document.createTextNode(` ${rule.newTitle}`));

      if (rule.favicon) {
        const faviconPreview = document.createElement('img');
        faviconPreview.src = rule.favicon;
        faviconPreview.className = 'favicon-preview';
        ruleContent.appendChild(faviconPreview);
      }
      
      // Create buttons container
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'rule-buttons';
      
      // Create toggle button
      const toggleButton = document.createElement('button');
      toggleButton.textContent = rule.disabled ? 'Enable' : 'Disable';
      toggleButton.className = 'toggle-button' + (rule.disabled ? '' : ' enabled');
      toggleButton.addEventListener('click', () => toggleRule(rule.id));
      
      // Create edit button
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.className = 'edit-button';
      editButton.addEventListener('click', () => editRule(rule));
      
      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete-button';
      deleteButton.addEventListener('click', () => deleteRule(rule.id));
      
      // Add buttons to container
      buttonsContainer.appendChild(toggleButton);
      buttonsContainer.appendChild(editButton);
      buttonsContainer.appendChild(deleteButton);
      
      // Add content and buttons to rule element
      ruleElement.appendChild(ruleContent);
      ruleElement.appendChild(buttonsContainer);
      
      // Add to appropriate container
      if (rule.disabled) {
        disabledRulesContainer.appendChild(ruleElement);
      } else {
        enabledRulesContainer.appendChild(ruleElement);
      }
    });
  });
}

function editRule(rule) {
  // Fill the form with existing rule data
  document.getElementById('matchType').value = rule.matchType;
  document.getElementById('pattern').value = rule.pattern;
  document.getElementById('newTitle').value = rule.newTitle;
  
  // Change add button to update button
  const addButton = document.getElementById('addRule');
  addButton.textContent = 'Update Rule';
  addButton.dataset.editId = rule.id;
  addButton.dataset.existingFavicon = rule.favicon || '';
  addButton.dataset.disabled = rule.disabled || false;
  
  // Add cancel button if it doesn't exist
  if (!document.getElementById('cancelEdit')) {
    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancelEdit';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', cancelEdit);
    addButton.parentNode.insertBefore(cancelButton, addButton.nextSibling);
  }
}

function cancelEdit() {
  const addButton = document.getElementById('addRule');
  addButton.textContent = 'Add Rule';
  delete addButton.dataset.editId;
  delete addButton.dataset.existingFavicon;
  delete addButton.dataset.disabled;
  
  const cancelButton = document.getElementById('cancelEdit');
  if (cancelButton) {
    cancelButton.remove();
  }
  
  clearInputs();
}

function deleteRule(id) {
  chrome.storage.local.get('rules', function(data) {
    const rules = data.rules || [];
    const newRules = rules.filter(rule => rule.id !== id);
    chrome.storage.local.set({ rules: newRules }, loadRules);
  });
}

function exportRules() {
  chrome.storage.local.get('rules', function(data) {
    const rules = data.rules || [];
    const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-tab-appearance-rules.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

function importRules(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const rules = JSON.parse(e.target.result);
      chrome.storage.local.set({ rules }, function() {
        loadRules();
      });
    } catch (error) {
      showAlert('Error importing rules. Please make sure the file is valid JSON.', 'Import Error');
    }
  };
  reader.readAsText(file);
}

function resetCustomUploadBox() {
  const customBox = document.querySelector('.custom-upload');
  customBox.textContent = ''; // Clear existing content
  
  // Recreate the plus icon
  const plusSpan = document.createElement('span');
  plusSpan.style.fontSize = '20px';
  plusSpan.textContent = '➕';
  customBox.appendChild(plusSpan);
  
  // Add line break
  customBox.appendChild(document.createElement('br'));
  
  // Add "Import" label
  const smallText = document.createElement('small');
  smallText.textContent = 'Import';
  customBox.appendChild(smallText);
}

function clearInputs() {
  document.getElementById('pattern').value = '';
  document.getElementById('newTitle').value = '';
  document.getElementById('faviconUpload').value = '';
  document.querySelectorAll('.emoji-item').forEach(item => item.classList.remove('selected'));
  delete document.getElementById('addRule').dataset.selectedEmoji;
  // Reset the custom upload box
  resetCustomUploadBox();
}

function toggleRule(id) {
  chrome.storage.local.get('rules', function(data) {
    const rules = data.rules || [];
    const newRules = rules.map(rule => {
      if (rule.id === id) {
        return { ...rule, disabled: !rule.disabled };
      }
      return rule;
    });
    chrome.storage.local.set({ rules: newRules }, loadRules);
  });
}

function removeAllRules() {
  if (confirm('Are you sure you want to remove all rules? This cannot be undone!')) {
    chrome.storage.local.set({ rules: [] }, loadRules);
  }
}
