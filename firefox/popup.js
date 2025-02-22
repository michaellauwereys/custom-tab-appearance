document.addEventListener('DOMContentLoaded', function() {
  loadRules();

  // Store file input state in browser storage when changed
  document.getElementById('faviconUpload').addEventListener('change', function(e) {
    if (this.files.length > 0) {
      this.classList.add('file-selected');
      const reader = new FileReader();
      reader.onload = function(event) {
        browser.storage.local.set({
          tempFavicon: {
            data: event.target.result,
            name: e.target.files[0].name
          }
        });
      };
      reader.readAsDataURL(this.files[0]);
    } else {
      this.classList.remove('file-selected');
    }
  });

  document.getElementById('addRule').addEventListener('click', addNewRule);
  document.getElementById('exportRules').addEventListener('click', exportRules);
  document.getElementById('importButton').addEventListener('click', () => {
    document.getElementById('importRules').click();
  });
  document.getElementById('importRules').addEventListener('change', importRules);

  // Check for stored favicon data when popup opens
  browser.storage.local.get('tempFavicon', function(data) {
    if (data.tempFavicon) {
      // Create a new file input element
      const container = new DataTransfer();
      const file = dataURLtoFile(data.tempFavicon.data, data.tempFavicon.name);
      container.items.add(file);
      document.getElementById('faviconUpload').files = container.files;
      
      // Clear the stored favicon
      browser.storage.local.remove('tempFavicon');
    }
  });
});

// Helper function to convert Data URL to File object
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type: mime});
}

function addNewRule() {
  const matchType = document.getElementById('matchType').value;
  const pattern = document.getElementById('pattern').value;
  const newTitle = document.getElementById('newTitle').value;
  const faviconInput = document.getElementById('faviconUpload');
  const addButton = document.getElementById('addRule');
  
  if (!pattern || !newTitle) {
    alert('Please fill in all fields');
    return;
  }

  const processRule = (faviconData = null) => {
    const rule = {
      matchType,
      pattern,
      newTitle,
      id: addButton.dataset.editId ? parseInt(addButton.dataset.editId) : Date.now()
    };

    if (faviconData) {
      rule.favicon = faviconData;
    }

    browser.storage.local.get('rules', function(data) {
      let rules = data.rules || [];
      if (addButton.dataset.editId) {
        // Update existing rule
        rules = rules.map(r => r.id === parseInt(addButton.dataset.editId) ? rule : r);
      } else {
        // Add new rule
        rules.push(rule);
      }
      
      browser.storage.local.set({ rules }, function() {
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
  const rulesList = document.getElementById('rulesList');
  browser.storage.local.get('rules', function(data) {
    const rules = data.rules || [];
    rulesList.innerHTML = '';
    
    rules.forEach(rule => {
      const ruleElement = document.createElement('div');
      ruleElement.className = 'rule-item';
      
      // Create buttons container
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'rule-buttons';
      
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
      buttonsContainer.appendChild(editButton);
      buttonsContainer.appendChild(deleteButton);
      
      const matchTypeLabel = document.createElement('strong');
      matchTypeLabel.textContent = `${rule.matchType}:`;
      ruleElement.appendChild(matchTypeLabel);
      ruleElement.appendChild(document.createTextNode(` ${rule.pattern}`));
      ruleElement.appendChild(document.createElement('br'));

      const titleLabel = document.createElement('strong');
      titleLabel.textContent = 'New Title:';
      ruleElement.appendChild(titleLabel);
      ruleElement.appendChild(document.createTextNode(` ${rule.newTitle}`));

      ruleElement.appendChild(buttonsContainer);
      rulesList.appendChild(ruleElement);
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
  
  const cancelButton = document.getElementById('cancelEdit');
  if (cancelButton) {
    cancelButton.remove();
  }
  
  clearInputs();
}

function deleteRule(id) {
  browser.storage.local.get('rules', function(data) {
    const rules = data.rules.filter(rule => rule.id !== id);
    browser.storage.local.set({ rules }, loadRules);
  });
}

function exportRules() {
  browser.storage.local.get('rules', function(data) {
    const rules = data.rules || [];
    const blob = new Blob([JSON.stringify(rules, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tab-rules.json';
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
      browser.storage.local.set({ rules }, function() {
        loadRules();
        alert('Rules imported successfully!');
      });
    } catch (error) {
      alert('Error importing rules. Please make sure the file is valid JSON.');
    }
  };
  reader.readAsText(file);
}

function clearInputs() {
  document.getElementById('pattern').value = '';
  document.getElementById('newTitle').value = '';
  document.getElementById('faviconUpload').value = '';
  // Also clear any stored temporary favicon
  browser.storage.local.remove('tempFavicon');
} 