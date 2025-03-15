console.log('Content script loaded');

async function getImageAsBase64(imageUrl) {
  console.log('Getting image as base64:', imageUrl);
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        console.log('Successfully converted image to base64');
        resolve(base64String);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

// Break down the process into smaller steps
async function processImageUrl(imageUrl) {
  try {
    console.log('Starting image processing');
    const base64Image = await getImageAsBase64(imageUrl);
    console.log('Got base64 image, sending to background...');
    
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'processImage',
        imageData: base64Image
      }, response => {
        if (chrome.runtime.lastError) {
          console.error('Error sending to background:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log('Successfully sent to background');
          resolve(response);
        }
      });
    });
  } catch (error) {
    console.error('Error in processImageUrl:', error);
    throw error;
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === 'extractText') {
    console.log('Processing image URL:', request.imageUrl);
    
    // Send immediate response
    sendResponse({ status: 'processing' });
    
    // Process the image
    processImageUrl(request.imageUrl)
      .then(() => {
        console.log('Image processing complete');
      })
      .catch(error => {
        console.error('Failed to process image:', error);
      });
  }
  
  // Return true to indicate we'll send a response asynchronously
  return true;
});

// Verify background script connection
chrome.runtime.sendMessage({ action: 'ping' }, response => {
  if (chrome.runtime.lastError) {
    console.error('Failed to connect to background script:', chrome.runtime.lastError);
  } else {
    console.log('Successfully connected to background script');
  }
});

console.log('Content script initialization complete'); 