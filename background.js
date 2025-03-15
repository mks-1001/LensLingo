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
        chrome.storage.local.set({
          'ocrResult': result,
          'imagePreview': request.imageUrl || request.imageData // Store the image data
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Storage error:', chrome.runtime.lastError);
          } else {
            console.log('Result saved to storage');
            chrome.windows.create({
              url: 'popup.html',
              type: 'popup',
              width: 400,
              height: 600
            });
          }
        });
      })
      .catch(error => {
        console.error('OCR Error:', error);
        chrome.storage.local.set({
          'ocrError': error.message
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

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info);
  if (info.menuItemId === 'extractText') {
    console.log('Sending message to content script');
    // Store the image URL directly
    chrome.storage.local.set({ 'imagePreview': info.srcUrl }, () => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'extractText',
        imageUrl: info.srcUrl
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
        }
      });
    });
  }
}); 