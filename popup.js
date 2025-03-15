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
  const previewImage = document.getElementById('preview-image');
  const uploadPrompt = document.querySelector('.upload-prompt');
  
  let currentText = '';

  // Check for both OCR results and image preview when popup loads
  console.log('Checking for OCR results and image preview...');
  chrome.storage.local.get(['ocrResult', 'imagePreview'], function(data) {
    console.log('Storage data:', data);
    
    // Display image preview if available
    if (data.imagePreview) {
      console.log('Found image preview');
      displayImagePreview(data.imagePreview);
      // Clear the image preview from storage
      chrome.storage.local.remove('imagePreview');
    }
    
    if (data.ocrResult) {
      console.log('Found OCR result:', data.ocrResult);
      displayResults(data.ocrResult);
      // Clear the result from storage after displaying
      chrome.storage.local.remove('ocrResult');
    }
  });

  // Check for pending image URL (from context menu)
  chrome.storage.local.get(['pendingImageUrl'], function(data) {
    if (data.pendingImageUrl) {
      displayImagePreview(data.pendingImageUrl);
      // Process the image
      fetch(data.pendingImageUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = function() {
            const base64data = reader.result.split(',')[1];
            chrome.runtime.sendMessage({
              action: 'processImage',
              imageData: base64data,
              imageUrl: data.pendingImageUrl
            });
          };
          reader.readAsDataURL(blob);
        });
      // Clear the pending URL
      chrome.storage.local.remove('pendingImageUrl');
    }
  });

  // Listen for OCR results
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ocrResult') {
      displayImagePreview(message.imageData);
      displayResults(message.result);
    } else if (message.action === 'ocrError') {
      errorMessage.textContent = message.error;
      errorMessage.classList.remove('hidden');
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

  function displayImagePreview(imageSource) {
    // If imageSource is a base64 string and doesn't start with data:image
    if (imageSource.startsWith('http') || imageSource.startsWith('data:image')) {
      previewImage.src = imageSource;
    } else {
      previewImage.src = `data:image/png;base64,${imageSource}`;
    }
    
    previewImage.classList.remove('hidden');
    uploadPrompt.classList.add('hidden');
    dropZone.classList.add('has-image');
    
    // Add click handler to allow replacing the image
    dropZone.style.cursor = 'pointer';
    dropZone.title = 'Click to upload a new image';
  }

  // File input handler
  fileInput.addEventListener('change', handleFileSelect);

  function handleFileSelect(event) {
    const file = event.target.files ? event.target.files[0] : event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        displayImagePreview(e.target.result);
        
        // Send base64 data for OCR processing
        const imageData = e.target.result.split(',')[1];
        chrome.runtime.sendMessage({
          action: 'processImage',
          imageData: imageData,
          imageUrl: e.target.result
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

  // Update drop zone handling
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
    handleFileSelect(e);
  });

  // Add click handler to allow replacing the image
  dropZone.addEventListener('click', () => {
    if (previewImage.classList.contains('hidden')) return;
    fileInput.click();
  });

  // Reset the upload area when starting new upload
  fileInput.addEventListener('click', () => {
    previewImage.classList.add('hidden');
    uploadPrompt.classList.remove('hidden');
    dropZone.classList.remove('has-image');
  });
}); 