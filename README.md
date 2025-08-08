# BookPeckers - AI-Powered Book Discovery Platform

A beautiful, modern web application that helps users discover books tailored to their learning interests using AI-powered recommendations.

## 🌟 Features

- **Single Page Experience**: Seamless workflow with smooth section transitions
- **AI-Powered Recommendations**: Uses OpenRouter API with Claude 3.5 Sonnet to suggest 3 relevant books
- **Instant Summaries**: Each book comes with a compelling 100-word summary
- **Detailed Analysis**: Complete 800-word book reports with synopsis, themes, and critical review
- **Beautiful Design**: Vibrant gradients, stunning animations, and professional typography
- **Responsive Layout**: Perfect experience on desktop, tablet, and mobile devices

## 🚀 User Journey

1. **Search**: Enter what you'd like to learn about
2. **Discover**: View 3 AI-recommended books with descriptions and summaries
3. **Analyze**: Click "Full Report" for comprehensive book analysis

## 🎨 Design Highlights

- **Static gradient background** - Purple to blue gradient
- **Hover animations** - Cards lift, scale, and shimmer on interaction
- **Smooth transitions** - Sections slide in with professional easing
- **Color psychology** - Vibrant accent colors guide user attention
- **Glass morphism** - Frosted glass effects with backdrop blur
- **Professional typography** - Inter font with gradient text effects

## 🏗️ Architecture

### Files Structure
```
BookPeckers/
├── index.html          # Single-page application structure
├── styles.css          # Complete styling with animations
├── script.js           # Application logic and API integration
├── config.js           # API configuration (gitignored)
├── .gitignore          # Protects sensitive configuration
└── README.md           # Documentation
```

### Security
- API key safely stored in `config.js` (excluded from git)
- Proper error handling and input validation
- No sensitive data exposed in browser console

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, ES6 JavaScript
- **AI Integration**: OpenRouter API with Claude 3.5 Sonnet
- **Design**: CSS Grid, Flexbox, CSS Animations, Backdrop Filter
- **Fonts**: Inter (Google Fonts)
- **Icons**: Font Awesome 6

## 🎯 Workflow Implementation

The app follows a streamlined workflow:

**Search Phase** → **Books with Summaries Phase** → **Full Report Phase**

- All content stays on one page
- Sections show/hide with smooth animations
- Navigation buttons for easy movement between phases
- Keyboard shortcuts (ESC) for quick navigation

## 📱 Responsive Design

- **Desktop**: Two-column book cards with side-by-side info and summaries
- **Tablet**: Stacked book cards with full-width layout
- **Mobile**: Single column with optimized spacing and touch targets

## 🔧 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- JavaScript ES6+ features used
- Progressive enhancement for older browsers

## 🎮 Interactive Features

- **Hover Effects**: Cards transform with scale, shadow, and color changes
- **Loading States**: Beautiful multi-ring spinner with bouncing dots
- **Toast Notifications**: Slide-in messages for user feedback
- **Parallax Scrolling**: Subtle background movement
- **Scroll Animations**: Elements fade in as they enter viewport
- **Keyboard Navigation**: ESC key for back navigation

## 🚀 Getting Started

1. Open `index.html` in your web browser
2. Enter any learning topic (e.g., "Machine Learning", "History", "Cooking")
3. Explore the recommended books and their summaries
4. Click "Full Report" for detailed analysis

## 🔐 Configuration

The API key is stored in `config.js` which is excluded from version control. The app uses OpenRouter's Claude 3.5 Sonnet model for intelligent book recommendations and analysis.

## 🎨 Color Palette

- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#10b981` (Emerald)  
- **Accent Pink**: `#ec4899`
- **Accent Cyan**: `#06b6d4`
- **Accent Orange**: `#f97316`
- **Background**: Purple to blue gradient

## 📄 License

© 2025 BookPeckers. All rights reserved.

---

**Built with ❤️ for book lovers and lifelong learners**