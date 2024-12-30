# Bionic Reading Extension

A Chrome extension that transforms web content into a more readable format using bionic reading techniques, specifically designed for ADHD readers.

## Features

- Clean reading view using Mozilla's Readability.js
- Bionic reading format (bold first half of words) for improved focus
- Overlay reader mode for distraction-free reading
- One-click activation via extension icon

## Technical Stack

- Chrome Extensions Manifest V3
- Mozilla Readability.js for content parsing
- TypeScript for type-safe development

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Load unpacked extension in Chrome from the `dist` folder

## How it Works

1. When clicking the extension icon, it creates a clean overlay of the current page
2. Readability.js processes the page content for better readability
3. The bionic reading algorithm bolds the first half of each word
4. Presents the content in a distraction-free reading interface