import { performGeminiVisionOCR } from './generative-ai.js';

console.log('Background script loaded');

function openPopupWindow(imageData, imageUrl) {
  chrome.windows.create({
    url: 'popup.html',
    type: 'popup',
    width: 400,
    height: 600
  }, (window) => {
    // Store the data for the new popup
    chrome.storage.local.set({
      'ocrImageData': imageData,
      'imagePreview': imageUrl
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);
  
  if (request.action === 'ping') {
    console.log('Received ping from content script');
    sendResponse({ status: 'ok' });
    return true;
  }
  
  if (request.action === 'processImage') {
    console.log('Processing image in background:', request.imageData);
    performGeminiVisionOCR(request.imageData)
      .then(result => {
        // Store result and open new popup
        chrome.storage.local.set({
          'ocrResult': result,
          'ocrImageData': request.imageData,
          'imagePreview': request.imageUrl
        }, () => {
          openPopupWindow(request.imageData, request.imageUrl);
        });
      })
      .catch(error => {
        console.error('OCR Error:', error);
        chrome.storage.local.set({
          'ocrError': error.message,
          'ocrImageData': request.imageData,
          'imagePreview': request.imageUrl
        }, () => {
          openPopupWindow(request.imageData, request.imageUrl);
        });
      });
    return true;
  }
  
  return true;
});

// Add context menu
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  chrome.contextMenus.create({
    id: 'extractText',
    title: 'Extract Text from Image',
    contexts: ['image']
  });
});

// Update context menu handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info);
  if (info.menuItemId === 'extractText') {
    chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      width: 400,
      height: 600
    }, (window) => {
      chrome.storage.local.set({ 
        'pendingImageUrl': info.srcUrl 
      });
    });
  }
}); 