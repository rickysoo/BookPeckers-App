# BookPeckers Google Analytics 4 Tracking Implementation

## Overview
Google Analytics 4 (GA4) tracking has been implemented to monitor user engagement and app performance.

**GA4 Measurement ID**: `G-Z0NC5LEY4H`

## Key Events Tracked

### 1. **Page View** (`page_view`)
**When**: App loads
**Parameters**:
- `page_title`: "BookPeckers - Find Your Best Read"
- `page_location`: Current URL

### 2. **Search Books** (`search_books`)
**When**: User initiates a book search
**Parameters**:
- `search_term`: The topic/query entered by user
- `search_method`: "manual_search"

**Business Value**: Track search volume, popular topics, user intent

### 3. **Books Found** (`books_found`)
**When**: Successfully returns book recommendations
**Parameters**:
- `search_term`: The search query that generated results
- `books_count`: Number of books returned (usually 3)
- `book_titles`: Comma-separated list of recommended book titles

**Business Value**: Measure search success rate, track which books are recommended most

### 4. **Search Failed** (`search_failed`)
**When**: Search fails due to validation or API issues
**Parameters**:
- `search_term`: The query that failed
- `error_type`: 
  - `"insufficient_results"`: No valid books found
  - `"general_error"`: API or technical failure

**Business Value**: Identify problematic search terms, monitor app reliability

### 5. **View Book Report** (`view_book_report`)
**When**: User clicks on a book to view full analysis
**Parameters**:
- `book_title`: Title of the clicked book
- `book_author`: Author of the clicked book
- `search_term`: Original search that led to this book
- `book_position`: Position in recommendations (1, 2, or 3)

**Business Value**: Track engagement depth, popular books, click-through rates

### 6. **New Search Clicked** (`new_search_clicked`)
**When**: User clicks "New Search" button
**Parameters**:
- `previous_search_term`: What they searched for before
- `books_were_shown`: Boolean indicating if books were previously displayed

**Business Value**: Monitor user journey, identify search refinement patterns

## Implementation Details

### HTML Integration
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Z0NC5LEY4H"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Z0NC5LEY4H');
</script>
```

### JavaScript Integration
```javascript
// Central tracking method
trackEvent(eventName, parameters = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
        console.log('GA Event:', eventName, parameters);
    }
}
```

## Analytics Insights Available

### User Behavior Flow
1. **Entry Point**: Page views and source tracking
2. **Search Patterns**: What topics users search for
3. **Success Rate**: Ratio of successful vs failed searches  
4. **Engagement Depth**: How many users view detailed book reports
5. **Book Popularity**: Which books get clicked most often
6. **User Journey**: Search → Results → Deep Dive patterns

### Key Metrics to Monitor

**Engagement Metrics**:
- Search conversion rate (searches that return results)
- Book click-through rate (% who view full reports)
- Average time on page
- Bounce rate

**Content Metrics**:
- Most popular search topics
- Most recommended books
- Most clicked book reports
- Search failure patterns

**Technical Metrics**:
- API failure rates
- Validation error frequencies
- Performance timing

### Custom Dimensions Available
- Search terms (for content strategy)
- Book titles (for partnership opportunities)  
- Book authors (for content curation)
- Error types (for technical monitoring)
- User journey stages (for UX optimization)

## Privacy & Compliance
- No personally identifiable information (PII) is tracked
- All tracking respects user privacy settings
- Data collection follows Google Analytics privacy policies
- Search terms may contain user interests but no personal data

## Development Notes
- Events include console logging for debugging
- All tracking is wrapped in existence checks for `gtag`
- Parameters are structured for easy querying in GA4
- Event names follow GA4 best practices and conventions