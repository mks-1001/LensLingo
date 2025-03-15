# Image Text Extractor Chrome Extension

A Chrome extension that extracts text from images using Google's Generative AI Vision capabilities. It supports multiple languages and provides automatic translation to English for non-English text.

## Features

- Extract text from images using Google's Generative AI
- Support for multiple languages with automatic language detection
- Automatic translation to English for non-English text
- Extract text from images on web pages via context menu
- Drag and drop or upload images directly
- Copy extracted text and translations to clipboard
- Clean and intuitive user interface

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your Gemini API key:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key or use an existing one
   - Copy the API key
   - Open `config.js` in the project root
   - Replace `<YOUR_GEMINI_API_KEY>` with your actual API key:
     ```javascript
     export const config = {
       GEMINI_API_KEY: 'your-api-key-here',
       // ... rest of the config
     };
     ```
4. Build the extension:
   ```bash
   npm run build
   ```
5. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension directory

## Usage

### Via Context Menu
1. Right-click on any image on a webpage
2. Select "Extract Text from Image"
3. View the extracted text in the popup window
4. If the text is not in English, click "Translate" to see the English translation

### Via Extension Popup
1. Click the extension icon in the Chrome toolbar
2. Either drag and drop an image or click "Choose File"
3. View the extracted text
4. For non-English text, use the "Translate" button to see the English translation

### Copy Features
- Use "Copy Text" to copy the original extracted text
- Use "Copy Translation" to copy the English translation (when available)

## Dependencies

- @google/generative-ai: For OCR and translation capabilities
- webpack: For bundling the extension

## Development

To modify the extension:

1. Make your changes to the source files
2. Rebuild the extension:
   ```bash
   npm run build
   ```
3. Reload the extension in Chrome

## Project Structure

image-text-extractor/
├── manifest.json
├── popup.html
├── styles.css
├── config.js
├── src/
│   ├── background.js
│   ├── popup.js
│   └── content.js
├── dist/
│   └── [bundled files]
└ 