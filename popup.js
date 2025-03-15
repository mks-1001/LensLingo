import { detectAndTranslate } from './translation-service.js';

document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
  
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const startOcrBtn = document.getElementById('start-ocr');
  const originalResult = document.getElementById('original-result');
  const translatedResult = document.getElementById('translated-result');
  const copyOriginalBtn = document.getElementById('copy-original');
  const copyTranslationBtn = document.getElementById('copy-translation');
  const translateBtn = document.getElementById('translate-btn');
  const errorMessage = document.getElementById('error-message');
  const languageText = document.getElementById('language-text');
  const translationContainer = document.getElementById('translation-container');
  
  let currentText = '';

  // Check for OCR results as soon as popup loads
  console.log('Checking for OCR results...'); // Debug log
  chrome.storage.local.get(['ocrResult'], function(data) {
    console.log('Storage data:', data); // Debug log
    if (data.ocrResult) {
      console.log('Found OCR result:', data.ocrResult); // Debug log
      displayResults(data.ocrResult);
      // Clear the result from storage after displaying
      chrome.storage.local.remove('ocrResult');
    }
  });

  async function displayResults(result) {
    console.log('Displaying result:', result);
    try {
      // Handle the result based on its type
      if (typeof result === 'string') {
        currentText = result;
      } else if (typeof result === 'object') {
        currentText = result.text || result.response || JSON.stringify(result);
      } else {
        currentText = String(result);
      }

      // Update the textarea with the extracted text
      if (currentText && currentText.length > 0) {
        originalResult.value = currentText;
        
        // Enable the buttons
        copyOriginalBtn.disabled = false;
        translateBtn.disabled = false;
        
        // Hide any previous error messages
        errorMessage.classList.add('hidden');
        
        console.log('Text displayed successfully:', currentText);
      } else {
        console.warn('Empty text result received');
      }

      // Remove automatic translation and language detection
      languageText.textContent = 'Click translate to detect language and translate';
      
    } catch (error) {
      console.error('Display error:', error);
      if (!originalResult.value) {
        errorMessage.textContent = 'Failed to display text. Please try again.';
        errorMessage.classList.remove('hidden');
      }
    }
  }

  // File input handler
  fileInput.addEventListener('change', handleFileSelect);

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const imageData = e.target.result.split(',')[1]; // Get base64 data
        chrome.runtime.sendMessage({
          action: 'processImage',
          imageData: imageData
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Translation button handler - updated
  translateBtn.addEventListener('click', async () => {
    if (!currentText) return;
    
    try {
      translateBtn.disabled = true;
      translateBtn.textContent = 'Translating...';
      languageText.textContent = 'Detecting language...';
      
      const translationResult = await detectAndTranslate(currentText);
      
      // Update language display
      languageText.textContent = `Detected Language: ${translationResult.detectedLanguage}`;
      
      // Show translation container and update text only if not English
      if (translationResult.detectedLanguage.toLowerCase() !== 'english') {
        translationContainer.style.display = 'block';
        translatedResult.value = translationResult.translatedText;
        copyTranslationBtn.style.display = 'inline-block';
        copyTranslationBtn.disabled = false;
      } else {
        translationContainer.style.display = 'none';
        copyTranslationBtn.style.display = 'none';
        languageText.textContent = 'Detected Language: English - No translation needed';
      }
      
      errorMessage.classList.add('hidden');
    } catch (error) {
      console.error('Translation error:', error);
      errorMessage.textContent = 'Translation failed. Please try again.';
      errorMessage.classList.remove('hidden');
    } finally {
      translateBtn.disabled = false;
      translateBtn.textContent = 'Translate';
    }
  });

  // Copy buttons functionality
  copyOriginalBtn.addEventListener('click', () => {
    originalResult.select();
    document.execCommand('copy');
    copyOriginalBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyOriginalBtn.textContent = 'Copy Text';
    }, 2000);
  });

  copyTranslationBtn.addEventListener('click', () => {
    translatedResult.select();
    document.execCommand('copy');
    copyTranslationBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyTranslationBtn.textContent = 'Copy Translation';
    }, 2000);
  });

  // Drag and drop handling
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    handleFileSelect(e);
  });
}); 