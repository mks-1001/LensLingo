import { performGeminiVisionOCR } from './generative-ai.js';

console.log('Background script loaded');

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
        console.log('OCR Result:', result);
        // Send the result directly back to the popup
        chrome.runtime.sendMessage({
          action: 'ocrResult',
          result: result,
          imageData: request.imageUrl || request.imageData
        });
      })
      .catch(error => {
        console.error('OCR Error:', error);
        chrome.runtime.sendMessage({
          action: 'ocrError',
          error: error.message
        });
      });
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
      // Store the image URL temporarily
      chrome.storage.local.set({ 
        'pendingImageUrl': info.srcUrl 
      });
    });
  }
}); 