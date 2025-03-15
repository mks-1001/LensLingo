# Image Text Extractor Chrome Extension

A Chrome extension that enables users to extract text from images using OCR technology.

## Features

- Extract text from images on web pages via context menu
- Drag and drop or upload images directly in the popup
- Copy extracted text to clipboard
- Simple and user-friendly interface
- Minimal permissions required

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

### Context Menu
1. Right-click on any image on a webpage
2. Select "Extract Text from Image"
3. Wait for the OCR processing to complete
4. View the extracted text in the popup

### Popup Interface
1. Click the extension icon in the toolbar
2. Either drag and drop an image or click "Choose File"
3. Click "Start OCR"
4. Once processing is complete, view the extracted text
5. Use the "Copy to Clipboard" button to copy the text

## Dependencies

- Tesseract.js for OCR processing

## Permissions

- activeTab: Required for accessing the current tab
- contextMenus: Required for adding the right-click menu option
- clipboardWrite: Required for the copy to clipboard functionality 