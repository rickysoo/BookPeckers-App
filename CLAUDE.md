# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookPeckers is an AI-powered book discovery platform built as a single-page vanilla JavaScript web application. It uses OpenRouter API with Claude 3.5 Sonnet to provide intelligent book recommendations and detailed analysis based on user learning interests.

## Development Commands

### Running the Application
```bash
# No build process required - open directly in browser
open index.html
# Or serve locally with Python
python -m http.server 8000
# Or with Node.js
npx http-server
```

### No Package Management
- This is a vanilla JS project with no npm dependencies
- External dependencies loaded via CDN (Font Awesome, Google Fonts)
- No build, test, or lint commands - pure HTML/CSS/JS

## Architecture

### Core Files
- `index.html` - Single-page application with all UI sections
- `script.js` - Main application logic and API integration 
- `styles.css` - Complete styling with animations and responsive design
- `config.js` - API configuration (git-ignored, contains OpenRouter API key)

### Application Flow
1. **Search Phase**: User enters learning topic
2. **Books Phase**: AI returns 3 book recommendations with summaries
3. **Report Phase**: Detailed 800-word analysis for selected books

### Key Classes and Structure
- `BookPeckersApp` class manages the entire application state
- Section-based UI with `show/hide` pattern for navigation
- Event-driven architecture with keyboard shortcuts (ESC navigation)

## API Integration

### OpenRouter Configuration
- Uses OpenRouter API with Claude 3.5 Sonnet model
- API key stored in `config.js` (excluded from git)
- Model: `openai/gpt-4o-mini` (configured in CONFIG object)

### API Calls
- Book recommendations: Generates 3 books with 100-word summaries
- Full reports: Creates 800-word detailed analysis
- Error handling for insufficient results and API failures

## Security Considerations

### API Key Management
- **CRITICAL**: API key in `config.js` is git-ignored
- Never commit `config.js` - it contains sensitive OpenRouter API key
- Key is loaded via `CONFIG.OPENROUTER_API_KEY` constant

### Current Security Issue
**WARNING**: The `config.js` file currently contains an exposed API key. This should be removed and replaced with environment-based configuration.

## Analytics Implementation

### Google Analytics 4 Tracking
- Measurement ID: `G-Z0NC5LEY4H` 
- Tracks: page views, searches, book clicks, failures
- Implementation in `script.js` with `trackEvent()` method
- Full tracking details documented in `analytics-tracking.md`

## UI/UX Features

### Design System
- Purple to blue gradient background
- Vibrant accent colors (indigo, emerald, pink, cyan, orange)
- Glass morphism effects with backdrop blur
- Hover animations with scale and shimmer effects

### Responsive Design
- Desktop: Two-column book cards
- Tablet/Mobile: Single column stacked layout  
- CSS Grid and Flexbox throughout

### Interactive Elements
- Loading spinners with animated rings
- Toast notifications for user feedback
- Keyboard navigation (ESC key)
- Smooth section transitions

## Development Guidelines

### Code Style
- ES6+ JavaScript with class-based architecture
- CSS custom properties for theming
- Mobile-first responsive design
- Semantic HTML structure

### Making Changes
- Test all API integrations with valid OpenRouter key
- Verify responsive design across breakpoints
- Check analytics tracking after UI changes
- Ensure accessibility with keyboard navigation

## File Exclusions
Per `.gitignore`:
- `config.js` (contains API keys)
- Node modules and build directories  
- IDE and OS generated files