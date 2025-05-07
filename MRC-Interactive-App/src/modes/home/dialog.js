export function showFileDialog(labelText, accept = '.json', multiple = false) {
  return new Promise((resolve, reject) => {
    const modal = document.createElement('div');
    modal.style = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
      font-family: 'Segoe UI', sans-serif;
    `;

    const box = document.createElement('div');
    box.style = `
      background: #fff; padding: 30px 35px; border-radius: 10px;
      min-width: 420px; text-align: center; box-shadow: 0 6px 18px rgba(0,0,0,0.2);
      position: relative;
    `;

    const label = document.createElement('div');
    label.textContent = labelText;
    label.style = 'margin-bottom: 20px; font-size: 1.1rem; font-weight: 600;';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = accept;
    fileInput.multiple = multiple;
    fileInput.style.display = 'none'; // Hide the original input

    const customFileBtn = document.createElement('button');
    customFileBtn.textContent = 'Select File';
    customFileBtn.style = `
      padding: 10px 20px; 
      background: #555; color: white;
      border: none; border-radius: 4px;
      font-size: 1rem; cursor: pointer;
      margin-bottom: 15px;
    `;

    const fileInfo = document.createElement('div');
    fileInfo.style = 'margin: 20px 0; font-size: 1rem; color: #444; min-height: 24px;';

    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Continue';
    continueBtn.disabled = true;
    continueBtn.style = `
      padding: 10px 22px; margin-top: 15px;
      background: #007bff; color: white;
      border: none; border-radius: 4px;
      font-size: 1rem; cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
      width: 150px;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style = `
      position: absolute; top: 10px; right: 15px; background: transparent;
      font-size: 1.8rem; border: none; cursor: pointer; color: #888;
    `;

    function cleanup() {
      document.body.removeChild(modal);
      document.removeEventListener('keydown', escHandler);
    }

    function escHandler(e) {
      if (e.key === 'Escape') {
        cleanup();
        reject(new Error('Dialog cancelled.'));
      }
    }

    customFileBtn.onclick = () => {
      fileInput.click();
    };

    fileInput.onchange = () => {
      if (!fileInput.files.length) return;
      
      const names = [...fileInput.files].map(f => {
        // Remove file extension
        const nameParts = f.name.split('.');
        if (nameParts.length > 1) {
          nameParts.pop(); // Remove the last part (extension)
        }
        return nameParts.join('.');
      }).join(', ');
      
      fileInfo.textContent = `Selected: ${names}`;
      continueBtn.disabled = false;
      continueBtn.style.opacity = '1';
    };

    continueBtn.onclick = () => {
      if (!fileInput.files.length) return;
      cleanup();
      resolve(fileInput.files);
    };

    closeBtn.onclick = () => {
      cleanup();
      reject(new Error('Dialog closed.'));
    };

    document.addEventListener('keydown', escHandler);

    box.appendChild(closeBtn);
    box.appendChild(label);
    box.appendChild(customFileBtn);
    box.appendChild(fileInput); // Add the hidden input
    box.appendChild(fileInfo);
    box.appendChild(continueBtn);
    modal.appendChild(box);
    document.body.appendChild(modal);
  });
}

export function showGoalFileDialog() {
  return new Promise((resolve, reject) => {
    let startFile = null;
    let goalFile = null;

    const modal = document.createElement('div');
    modal.style = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; font-family: 'Segoe UI', sans-serif;
    `;

    const box = document.createElement('div');
    box.style = `
      background: #fff; padding: 35px 40px; border-radius: 12px;
      width: 500px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      position: relative; display: flex; flex-direction: column;
    `;

    const title = document.createElement('div');
    title.textContent = 'Load START and GOAL configurations';
    title.style = `
      margin-bottom: 30px; font-weight: 600; font-size: 1.3rem;
      text-align: center; color: #333; border-bottom: 1px solid #eee;
      padding-bottom: 15px;
    `;
    
    // Create a container for the configuration sections
    const configContainer = document.createElement('div');
    configContainer.style = `
      display: flex; flex-direction: column; gap: 25px;
      margin-bottom: 35px;
    `;
    
    // START CONFIG SECTION
    const startSection = document.createElement('div');
    startSection.style = `
      display: flex; flex-direction: column; align-items: center;
      padding: 15px; border-radius: 8px; background: #f7f7f7;
    `;
    
    const startHeader = document.createElement('div');
    startHeader.textContent = 'START Configuration';
    startHeader.style = 'font-weight: 600; margin-bottom: 15px; color: #444; font-size: 1.1rem;';
    
    const startLabel = document.createElement('div');
    startLabel.textContent = 'Not selected';
    startLabel.style = `
      margin-bottom: 15px; font-size: 0.95rem; color: #666;
      min-height: 20px; width: 100%; text-align: center;
      font-style: italic;
    `;

    const chooseStartBtn = document.createElement('button');
    chooseStartBtn.textContent = 'Choose File';
    chooseStartBtn.style = `
      padding: 8px 15px;
      background: #555; color: white;
      border: none; border-radius: 4px;
      cursor: pointer; font-size: 0.95rem;
      width: 180px; transition: background 0.2s;
    `;
    chooseStartBtn.onmouseover = () => { chooseStartBtn.style.background = '#444'; };
    chooseStartBtn.onmouseout = () => { chooseStartBtn.style.background = '#555'; };
    
    // GOAL CONFIG SECTION
    const goalSection = document.createElement('div');
    goalSection.style = `
      display: flex; flex-direction: column; align-items: center;
      padding: 15px; border-radius: 8px; background: #f7f7f7;
    `;
    
    const goalHeader = document.createElement('div');
    goalHeader.textContent = 'GOAL Configuration';
    goalHeader.style = 'font-weight: 600; margin-bottom: 15px; color: #444; font-size: 1.1rem;';
    
    const goalLabel = document.createElement('div');
    goalLabel.textContent = 'Not selected';
    goalLabel.style = `
      margin-bottom: 15px; font-size: 0.95rem; color: #666;
      min-height: 20px; width: 100%; text-align: center;
      font-style: italic;
    `;

    const chooseGoalBtn = document.createElement('button');
    chooseGoalBtn.textContent = 'Choose File';
    chooseGoalBtn.style = `
      padding: 8px 15px;
      background: #555; color: white;
      border: none; border-radius: 4px;
      cursor: pointer; font-size: 0.95rem;
      width: 180px; transition: background 0.2s;
    `;
    chooseGoalBtn.onmouseover = () => { chooseGoalBtn.style.background = '#444'; };
    chooseGoalBtn.onmouseout = () => { chooseGoalBtn.style.background = '#555'; };

    // CONTINUE BUTTON SECTION
    const buttonContainer = document.createElement('div');
    buttonContainer.style = `
      display: flex; justify-content: center; 
      margin-top: 10px;
    `;

    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Continue';
    continueBtn.disabled = true;
    continueBtn.style = `
      padding: 12px 25px;
      background: #007bff; color: white;
      border: none; border-radius: 5px;
      font-size: 1.05rem; cursor: pointer;
      opacity: 0.6; transition: all 0.2s;
      width: 180px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    `;
    continueBtn.onmouseover = () => { 
      if (!continueBtn.disabled) continueBtn.style.background = '#0069d9'; 
    };
    continueBtn.onmouseout = () => { 
      if (!continueBtn.disabled) continueBtn.style.background = '#007bff'; 
    };

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style = `
      position: absolute; top: 15px; right: 20px;
      background: transparent;
      font-size: 1.8rem; border: none; cursor: pointer; color: #888;
      transition: color 0.2s;
    `;
    closeBtn.onmouseover = () => { closeBtn.style.color = '#333'; };
    closeBtn.onmouseout = () => { closeBtn.style.color = '#888'; };

    function cleanup() {
      document.body.removeChild(modal);
      document.removeEventListener('keydown', escHandler);
    }

    function escHandler(e) {
      if (e.key === 'Escape') {
        cleanup();
        reject(new Error('Dialog cancelled.'));
      }
    }

    function maybeEnableContinue() {
      if (startFile && goalFile) {
        continueBtn.disabled = false;
        continueBtn.style.opacity = '1';
        continueBtn.style.cursor = 'pointer';
      }
    }

    // Create hidden file inputs
    const startFileInput = document.createElement('input');
    startFileInput.type = 'file';
    startFileInput.accept = '.json';
    startFileInput.style.display = 'none';
    
    const goalFileInput = document.createElement('input');
    goalFileInput.type = 'file';
    goalFileInput.accept = '.json';
    goalFileInput.style.display = 'none';

    chooseStartBtn.onclick = () => {
      // Add a small delay before opening the file dialog
      setTimeout(() => {
        startFileInput.click();
      }, 100);
    };

    startFileInput.onchange = () => {
      if (startFileInput.files[0]) {
        startFile = startFileInput.files[0];
        // Remove file extension
        const nameParts = startFile.name.split('.');
        if (nameParts.length > 1) {
          nameParts.pop(); // Remove the last part (extension)
        }
        const fileNameWithoutExt = nameParts.join('.');
        
        startLabel.textContent = fileNameWithoutExt;
        startLabel.style.fontStyle = 'normal';
        startLabel.style.color = '#333';
        startSection.style.background = '#eaf7ff';
        maybeEnableContinue();
      }
    };

    chooseGoalBtn.onclick = () => {
      // Add a small delay before opening the file dialog
      setTimeout(() => {
        goalFileInput.click();
      }, 100);
    };

    goalFileInput.onchange = () => {
      if (goalFileInput.files[0]) {
        goalFile = goalFileInput.files[0];
        // Remove file extension
        const nameParts = goalFile.name.split('.');
        if (nameParts.length > 1) {
          nameParts.pop(); // Remove the last part (extension)
        }
        const fileNameWithoutExt = nameParts.join('.');
        
        goalLabel.textContent = fileNameWithoutExt;
        goalLabel.style.fontStyle = 'normal';
        goalLabel.style.color = '#333';
        goalSection.style.background = '#eaf7ff';
        maybeEnableContinue();
      }
    };

    continueBtn.onclick = () => {
      cleanup();
      resolve([startFile, goalFile]);
    };

    closeBtn.onclick = () => {
      cleanup();
      reject(new Error('Dialog closed.'));
    };

    document.addEventListener('keydown', escHandler);

    // Assemble the start section
    startSection.appendChild(startHeader);
    startSection.appendChild(startLabel);
    startSection.appendChild(chooseStartBtn);
    
    // Assemble the goal section
    goalSection.appendChild(goalHeader);
    goalSection.appendChild(goalLabel);
    goalSection.appendChild(chooseGoalBtn);
    
    // Add both sections to the container
    configContainer.appendChild(startSection);
    configContainer.appendChild(goalSection);
    
    // Add the continue button to its container
    buttonContainer.appendChild(continueBtn);
    
    // Build the complete dialog
    box.appendChild(closeBtn);
    box.appendChild(title);
    box.appendChild(configContainer);
    box.appendChild(buttonContainer);
    box.appendChild(startFileInput); // Hidden inputs
    box.appendChild(goalFileInput);
    
    modal.appendChild(box);
    document.body.appendChild(modal);
  });
}