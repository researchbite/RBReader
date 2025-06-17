# Chrome Extension Store Content

## Store Listing Content

### Title
Jargon Translator - Academic Text Simplifier

### Summary
Transform dense academic writing into plain language with AI-powered translation, bionic reading, and smart highlighting for researchers.

### Description

**Make Academic Research More Accessible**

Jargon Translator is designed specifically for researchers who need to digest complex academic papers quickly and effectively. Our AI-powered extension transforms dense scholarly writing into clear, understandable language while preserving the original meaning.

**🎯 Core Features:**

**Jargon Translator** - The flagship feature that overlays live plain-language translations on each paragraph. Choose between High School, College, and Academia levels to control simplification depth. Results are cached for instant toggling between original and simplified versions.

**Bionic Reading** - Emphasizes the first letters of words to improve reading speed and comprehension, perfect for scanning through research papers.

**AI-Powered Highlighting** - Uses OpenAI's GPT-4 to automatically identify and highlight the 5-10 most important sentences in any article, helping you focus on key insights.

**Reading Statistics** - Track your reading time and maintain a history of articles you've read, perfect for research productivity tracking.

**✨ Key Benefits:**
- Instant translation of complex academic jargon
- Distraction-free reading overlay
- Keyboard shortcuts (Esc to exit) for quick access
- Customizable reading experience with multiple simplification levels
- Works on any webpage with readable content
- Secure local storage of your preferences and reading history

**🔬 Perfect for:**
- Graduate students tackling complex research papers
- Researchers exploring new fields outside their expertise
- Academics reviewing literature across disciplines
- Anyone who needs to understand technical documentation quickly

**🛡️ Privacy-First Design:**
- Your OpenAI API key is stored securely in Chrome's sync storage
- No data is sent to our servers - all processing happens locally or directly with OpenAI
- Reading history stays on your device
- Full transparency in data usage

Transform your research workflow today with Jargon Translator!

### Category
Productivity

### Language
English

---

## Privacy Practices Justifications

### Single Purpose Description
Jargon Translator serves a single, focused purpose: to help researchers and students understand complex academic and technical content by providing AI-powered text simplification, bionic reading enhancement, and intelligent highlighting. All features work together to create a comprehensive reading assistance tool specifically designed for academic and research contexts.

### Permission Justifications

#### activeTab Permission
**Justification:** The activeTab permission is essential for our extension to function. We need access to the currently active tab to:
- Extract readable content from academic papers and articles using Mozilla's Readability library
- Inject our reader overlay interface onto the current webpage
- Apply text transformations (jargon translation, bionic reading, highlighting) to the page content
- Track reading time for the current article
This permission ensures we only access the tab when the user explicitly activates our extension, maintaining privacy while providing core functionality.

#### Host Permission Use
**Justification:** Host permissions are required to:
- Access and parse content from academic websites, research repositories, and documentation sites
- Inject our content script and reader overlay on any webpage containing text the user wants to simplify
- Extract article content using the Readability library across different domains
- Apply our reading enhancements (translation, highlighting, bionic reading) to content regardless of the source website
We only access content when users explicitly activate the extension, and we don't collect or transmit webpage data to our servers.

#### Remote Code Use
**Justification:** Remote code execution is necessary for:
- Loading the Mozilla Readability library from CDN to extract clean article content from web pages
- Accessing OpenAI's API endpoints to provide AI-powered jargon translation and intelligent highlighting features
- Ensuring users always have access to the latest version of content parsing algorithms
All remote code serves the extension's core purpose of text simplification and reading enhancement. No user data is processed by remote code beyond the OpenAI API calls that users explicitly configure.

#### Scripting Permission
**Justification:** Scripting permissions are fundamental to our extension's operation:
- Injecting the reader overlay interface into web pages when users activate the extension
- Applying text transformations (jargon translation, bionic reading formatting, AI highlighting) to page content
- Managing the reading timer and statistics tracking
- Handling user interactions with our reading interface (toggles, settings, navigation)
- Preserving and restoring original text content when users switch between simplified and original versions
All scripting serves the direct purpose of providing reading assistance and text simplification features.

#### Storage Permission
**Justification:** Storage permissions are required to:
- Save user preferences (reading level, bionic reading settings, highlight preferences)
- Cache translated text to avoid re-processing the same content, improving performance and reducing API costs
- Store reading statistics and article history for productivity tracking
- Securely store the user's OpenAI API key in Chrome's sync storage
- Maintain extension settings across browser sessions and devices
All stored data directly supports the extension's text simplification and reading enhancement functionality. No personal browsing data is collected beyond what's necessary for the extension's operation.

---

## Data Usage Compliance Certification

### Data Collection and Usage
- **User Content:** We process webpage text content only when users explicitly activate the extension for text simplification purposes
- **API Keys:** User-provided OpenAI API keys are stored securely in Chrome's sync storage and used only for AI-powered features
- **Reading Data:** Reading time and article history are stored locally for user productivity tracking
- **Preferences:** User settings and cached translations are stored locally to improve user experience

### Data Transmission
- **OpenAI API:** Article text is sent to OpenAI's API only when users enable AI features (translation, highlighting) with their own API key
- **No Third-Party Sharing:** We do not share, sell, or transmit user data to any third parties beyond the user-configured OpenAI API calls
- **Local Processing:** All other data processing occurs locally on the user's device

### User Control
- Users have complete control over their data through extension settings
- Reading history and cached translations can be cleared at any time
- API key usage is entirely optional and user-controlled
- Extension can be uninstalled at any time, removing all stored data

This extension complies with Chrome Web Store Developer Program Policies by maintaining transparency, user control, and data minimization principles while serving its single purpose of academic text simplification and reading enhancement. 