class BookPeckersApp {
    constructor() {
        // Secure configuration management
        this.config = this.loadConfig();
        this.currentTopic = '';
        this.currentBooks = [];
        this.currentBookIndex = -1;
        
        this.initializeEventListeners();
        this.trackPageView();
    }

    loadConfig() {
        // Secure configuration loading with fallbacks
        const config = {
            API_BASE_URL: 'https://openrouter.ai/api/v1/chat/completions',
            MODEL: 'openai/gpt-4o-mini',
            SITE_NAME: 'BookPeckers',
            SITE_URL: window.location.origin || 'https://bookpeckers.com'
        };

        // Check for environment variables (for production deployment)
        if (typeof process !== 'undefined' && process.env) {
            config.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        }
        // Check for config object from external file (development)
        else if (typeof CONFIG !== 'undefined' && CONFIG.OPENROUTER_API_KEY) {
            config.OPENROUTER_API_KEY = CONFIG.OPENROUTER_API_KEY;
            config.API_BASE_URL = CONFIG.API_BASE_URL || config.API_BASE_URL;
            config.MODEL = CONFIG.MODEL || config.MODEL;
            config.SITE_NAME = CONFIG.SITE_NAME || config.SITE_NAME;
            config.SITE_URL = CONFIG.SITE_URL || config.SITE_URL;
        }
        // Check for Vercel environment variables
        else if (typeof window !== 'undefined' && window.ENV_OPENROUTER_API_KEY) {
            config.OPENROUTER_API_KEY = window.ENV_OPENROUTER_API_KEY;
        }

        // Validate that API key is present
        if (!config.OPENROUTER_API_KEY) {
            console.error('🚨 Security Error: No API key configured. Please set OPENROUTER_API_KEY environment variable.');
            this.showConfigError();
        }

        return config;
    }

    showConfigError() {
        const searchSection = document.getElementById('search-section');
        if (searchSection) {
            searchSection.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #f87171;">
                    <h2>🚨 Configuration Error</h2>
                    <p>API key not configured. Please contact the administrator.</p>
                    <p style="font-size: 0.9rem; opacity: 0.8;">For developers: Set OPENROUTER_API_KEY environment variable.</p>
                </div>
            `;
        }
    }

    sanitizeInput(input) {
        // Remove potentially harmful characters while preserving useful punctuation
        return input
            .replace(/[<>\"'&]/g, '') // Remove HTML/XSS chars
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
            .replace(/script|javascript|vbscript|onload|onerror|onclick/gi, '') // Remove script-related keywords
            .trim()
            .substring(0, 200); // Limit length to prevent abuse
    }

    validateSearchInput(input) {
        // Allow letters, numbers, common punctuation, and spaces
        const validPattern = /^[a-zA-Z0-9\s\-_.,!?()&+:;\/\\]{2,200}$/;
        
        // Check against valid pattern
        if (!validPattern.test(input)) {
            return false;
        }
        
        // Additional checks for suspicious patterns
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /data:text\/html/i,
            /eval\(/i,
            /function\(/i,
            /setTimeout\(/i,
            /setInterval\(/i
        ];
        
        return !suspiciousPatterns.some(pattern => pattern.test(input));
    }

    sanitizeErrorMessage(error) {
        // Convert internal errors to user-friendly messages without leaking implementation details
        const userFriendlyMessages = {
            'validation_failed': 'We encountered an issue finding books for your topic. Please try a different search.',
            'no_books_returned': 'No books found for your search. Please try a different topic.',
            'ai_declined_nonsensical': 'Please enter a valid learning topic.',
            'api_error': 'Service temporarily unavailable. Please try again later.',
            'network_error': 'Connection issue. Please check your internet and try again.',
            'parse_error': 'There was an issue processing the results. Please try again.'
        };

        // Check if it's a known error type
        const errorMessage = error.message || error.toString();
        for (const [errorType, userMessage] of Object.entries(userFriendlyMessages)) {
            if (errorMessage.includes(errorType)) {
                return userMessage;
            }
        }

        // For unknown errors, return generic message without implementation details
        return 'An unexpected error occurred. Please try again.';
    }

    // Google Analytics Event Tracking
    trackEvent(eventName, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
            console.log('GA Event:', eventName, parameters);
        }
    }

    trackPageView() {
        this.trackEvent('page_view', {
            page_title: 'BookPeckers - Find Your Best Read',
            page_location: window.location.href
        });
    }

    initializeEventListeners() {
        // Main search functionality
        document.getElementById('findBooksBtn').addEventListener('click', () => this.findBooks());
        document.getElementById('learningTopic').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.findBooks();
        });

        // Navigation controls
        document.getElementById('newSearchBtn').addEventListener('click', () => this.confirmNewSearch());

        // Report action buttons
        document.getElementById('copyReportBtn').addEventListener('click', () => this.copyReportAsMarkdown());
        document.getElementById('saveReportBtn').addEventListener('click', () => this.showSaveComingSoon());
        document.getElementById('goTopBtn').addEventListener('click', () => this.scrollToTop());

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key to hide report or go back to search
            if (e.key === 'Escape') {
                if (document.getElementById('bookReportSection').style.display !== 'none') {
                    this.hideBookReport();
                } else if (document.getElementById('booksSection').style.display !== 'none') {
                    this.showSearchSection();
                }
            }
        });
    }

    showSuccessMessage(message) {
        this.showTemporaryMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showTemporaryMessage(message, 'error');
    }

    showSearchError(message) {
        const errorElement = document.getElementById('searchError');
        const messageElement = document.getElementById('searchErrorMessage');
        messageElement.textContent = message;
        errorElement.style.display = 'block';
    }

    hideSearchError() {
        const errorElement = document.getElementById('searchError');
        errorElement.style.display = 'none';
    }

    showTemporaryMessage(message, type) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: linear-gradient(135deg, #10b981, #22c55e);' : 'background: linear-gradient(135deg, #ef4444, #f97316);'}
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    async findBooks() {
        const rawTopic = document.getElementById('learningTopic').value.trim();
        
        // Input validation and sanitization
        if (!rawTopic) {
            this.showSearchError('Please enter what you\'d like to learn about');
            return;
        }
        
        // Sanitize and validate input
        const topic = this.sanitizeInput(rawTopic);
        if (!this.validateSearchInput(topic)) {
            this.showSearchError('Please enter a valid learning topic (letters, numbers, and common punctuation only)');
            return;
        }

        // Clear any previous errors
        this.hideSearchError();

        this.currentTopic = topic;
        
        // Track search initiated
        this.trackEvent('search_books', {
            search_term: topic,
            search_method: 'manual_search'
        });
        
        this.showLoading();

        try {
            // Get validated book recommendations first
            const books = await this.findBooksWithValidation(topic);
            
            // Prefetch all full reports in parallel for valid books only
            const booksWithAnalysis = await Promise.all(
                books.map(async (book, index) => {
                    try {
                        const analysis = await this.getBookAnalysis(book);
                        return { ...book, analysis, index };
                    } catch (error) {
                        console.error(`Error getting analysis for ${book.title}:`, error);
                        return { ...book, analysis: 'Analysis not available at this time.', index };
                    }
                })
            );
            
            this.currentBooks = booksWithAnalysis;
            
            // Track successful book recommendations
            this.trackEvent('books_found', {
                search_term: this.currentTopic,
                books_count: booksWithAnalysis.length,
                book_titles: booksWithAnalysis.map(book => book.title).join(', ')
            });
            
            this.displayBooks(booksWithAnalysis);
        } catch (error) {
            console.error('Error finding books:', error);
            this.hideLoading();
            
            // Track search failure
            let errorType = 'general_error';
            if (error.message === 'validation_failed') {
                errorType = 'validation_failed';
            } else if (error.message === 'no_books_returned') {
                errorType = 'no_books_returned';
            } else if (error.message === 'ai_declined_nonsensical') {
                errorType = 'ai_declined_nonsensical';
            } else if (error.message.includes('more specific')) {
                errorType = 'insufficient_results';
            }
            
            this.trackEvent('search_failed', {
                search_term: this.currentTopic,
                error_type: errorType
            });
            
            // Make sure we're on the search section to show the error
            this.showSearchSection();
            
            // Show sanitized error message to prevent information leakage
            const userMessage = this.sanitizeErrorMessage(error);
            this.showSearchError(userMessage);
        }
    }

    async getBookRecommendations(topic) {
        const prompt = `You are a knowledgeable librarian and book expert. A user wants to learn about "${topic}".

⚠️ CRITICAL: ONLY RECOMMEND REAL BOOKS THAT ACTUALLY EXIST ⚠️

STRICT REQUIREMENTS:
- You MUST recommend only REAL, PUBLISHED books by verified authors
- You MUST provide EXACT titles and author names as they appear on the book
- NEVER invent, hallucinate, or create fictional books, authors, or titles
- If uncertain about a book's existence, DO NOT include it
- Verify each book is real and well-known in its field

DO NOT DO THIS (common AI mistakes):
❌ Creating fake author names with random combinations of names
❌ Making up book titles that sound plausible but don't exist  
❌ Combining real authors with fake titles or vice versa
❌ Including books that "might exist" without certainty

WHAT TO DO:
✅ Only include books you're 100% confident exist
✅ Use exact titles and author names from real publications
✅ Focus on popular, well-established books in the field
✅ If fewer than 3 real books exist on the topic, return fewer books

Please recommend exactly 3 REAL, VERIFIED books for learning about "${topic}":

Format as JSON array:
[
  {
    "title": "Exact Real Book Title",
    "author": "Real Author Name", 
    "description": "Two-sentence description of actual book content and why it's valuable."
  }
]

Double-check each book is REAL before including it. Quality over quantity - better to return 1-2 real books than include any fake ones.`;

        const response = await fetch(this.config.API_BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': this.config.SITE_URL,
                'X-Title': this.config.SITE_NAME
            },
            body: JSON.stringify({
                model: this.config.MODEL,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error('api_error');
        }

        const data = await response.json();
        console.log('Full API Response:', data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Unexpected API response structure:', data);
            throw new Error('api_error');
        }
        
        const content = data.choices[0].message.content;
        console.log('API Response Content:', content);
        
        // Parse JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            console.log('JSON Match Found:', jsonMatch[0]);
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log('Parsed Books:', parsed);
                return parsed;
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Failed to parse:', jsonMatch[0]);
                throw new Error('parse_error');
            }
        } else {
            console.log('AI declined to provide books for this topic:', content);
            // If AI refuses to provide books for nonsensical topics, throw specific error
            throw new Error('ai_declined_nonsensical');
        }
    }

    async getBookSummary(book) {
        const prompt = `Write a compelling 100-word book summary for "${book.title}" by ${book.author}.

The summary should:
- Be exactly around 100 words
- Capture the main themes and key insights
- Explain what readers will learn
- Be engaging and make someone want to read the book
- Focus on the practical value and knowledge gained

Write in a professional, engaging tone that would appeal to someone interested in learning about this topic.`;

        const response = await fetch(this.config.API_BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': this.config.SITE_URL,
                'X-Title': this.config.SITE_NAME
            },
            body: JSON.stringify({
                model: this.config.MODEL,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response (Summary):', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    async getBookAnalysis(book) {
        const prompt = `Create a comprehensive 800-word analysis for the REAL, EXISTING book "${book.title}" by ${book.author}.

CRITICAL REQUIREMENTS:
- This book MUST actually exist - verify the title and author are correct
- All information must be FACTUALLY ACCURATE about the actual book
- NEVER make up or hallucinate content that isn't in the real book
- Base your analysis on the ACTUAL published book content only
- If you're not certain about specific details, be general but accurate

Structure your analysis with these main sections using **section headings**:

**Complete Synopsis**
Write 2-3 detailed paragraphs about the ACTUAL book's content, main arguments, and structure. Only include information that is factually correct about this real book.

**Key Themes and Concepts** 
Write 2-3 paragraphs explaining the ACTUAL themes and concepts from the real book. Focus on what the book truly covers.

**Critical Review**
Write 2-3 paragraphs analyzing the book's actual strengths, weaknesses, writing style, and effectiveness based on the real book.

**Who Should Read This**
Write 1-2 paragraphs about who would actually benefit from this specific book based on its real content.

**Key Takeaways**
Write 2-3 paragraphs about insights readers will actually gain from this real book.

Important requirements:
- ALL information must be factually accurate
- Use **Section Title** only for the 5 main sections above
- Write in complete paragraphs with flowing text
- Do not use numbered lists, bullet points, or sub-headings
- Only include information you're confident is accurate about this specific book
- Aim for exactly 800 words total`;

        const response = await fetch(this.config.API_BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': this.config.SITE_URL,
                'X-Title': this.config.SITE_NAME
            },
            body: JSON.stringify({
                model: this.config.MODEL,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1200
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response (Analysis):', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    showLoading() {
        document.getElementById('searchSection').style.display = 'none';
        document.getElementById('booksSection').style.display = 'none';
        document.getElementById('bookReportSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loadingSection').style.display = 'none';
    }

    showSearchSection() {
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('booksSection').style.display = 'none';
        document.getElementById('bookReportSection').style.display = 'none';
        document.getElementById('searchSection').style.display = 'block';
        
        // Track new search initiated
        this.trackEvent('new_search_clicked', {
            previous_search_term: this.currentTopic,
            books_were_shown: this.currentBooks.length > 0
        });
        
        // Clear the search input and any errors
        document.getElementById('learningTopic').value = '';
        this.hideSearchError();
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showBooksSection() {
        document.getElementById('searchSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('booksSection').style.display = 'block';
        
        // Hide report section
        document.getElementById('bookReportSection').style.display = 'none';
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showBookReport() {
        // Keep books section visible and show report below
        document.getElementById('bookReportSection').style.display = 'block';
        
        // Smooth scroll to report
        document.getElementById('bookReportSection').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    hideBookReport() {
        document.getElementById('bookReportSection').style.display = 'none';
    }

    displayBooks(books) {
        this.hideLoading();
        
        // Update the books heading with the current topic
        const booksHeading = document.getElementById('booksHeading');
        if (this.currentTopic) {
            booksHeading.textContent = `Recommended Books for You - ${this.currentTopic}`;
        } else {
            booksHeading.textContent = 'Recommended Books for You';
        }
        
        const booksGrid = document.getElementById('booksGrid');
        booksGrid.innerHTML = '';

        books.forEach((book, index) => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            // Create secure DOM elements without innerHTML
            const cardContent = document.createElement('div');
            cardContent.className = 'book-card-content';
            
            const title = document.createElement('h3');
            title.textContent = book.title;
            
            const author = document.createElement('p');
            author.className = 'book-author';
            author.textContent = `by ${book.author}`;
            
            const description = document.createElement('p');
            description.className = 'book-description';
            description.textContent = book.description;
            
            cardContent.appendChild(title);
            cardContent.appendChild(author);
            cardContent.appendChild(description);
            bookCard.appendChild(cardContent);

            // Add click event to the entire book card
            bookCard.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadBookReport(index);
            });
            
            booksGrid.appendChild(bookCard);
        });

        this.showBooksSection();
    }

    loadBookReport(bookIndex) {
        const book = this.currentBooks[bookIndex];
        this.currentBookIndex = bookIndex;
        
        // Track book report viewed
        this.trackEvent('view_book_report', {
            book_title: book.title,
            book_author: book.author,
            search_term: this.currentTopic,
            book_position: bookIndex + 1
        });
        
        // Update the report section with book info
        document.getElementById('reportBookTitle').textContent = book.title;
        document.getElementById('reportAuthor').textContent = book.author;
        
        // Use prefetched analysis (no loading needed!)
        if (book.analysis) {
            // Secure HTML rendering with proper headings
            const reportContent = document.getElementById('reportContent');
            reportContent.innerHTML = ''; // Clear existing content
            
            // Create safely formatted HTML
            const formattedHTML = this.formatAnalysisToSecureHTML(book.analysis);
            reportContent.appendChild(formattedHTML);
        } else {
            const reportContent = document.getElementById('reportContent');
            reportContent.textContent = 'Analysis not available for this book.';
        }
        
        // Show report below books
        this.showBookReport();
    }

    formatAnalysisToSecureHTML(analysis) {
        // Create a container element
        const container = document.createElement('div');
        container.className = 'analysis-content';
        
        // Split analysis into paragraphs and sections
        const sections = analysis.split(/\*\*(Complete Synopsis|Key Themes and Concepts|Chapter Outline|Critical Review|Who Should Read This|Key Takeaways)\*\*/gi);
        
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i].trim();
            if (!section) continue;
            
            // Check if this is a heading
            if (/^(Complete Synopsis|Key Themes and Concepts|Chapter Outline|Critical Review|Who Should Read This|Key Takeaways)$/i.test(section)) {
                const heading = document.createElement('h3');
                heading.textContent = section;
                heading.style.color = '#6366f1';
                heading.style.marginTop = '2rem';
                heading.style.marginBottom = '1rem';
                heading.style.fontSize = '1.25rem';
                heading.style.fontWeight = '600';
                container.appendChild(heading);
            } else {
                // Handle content paragraphs
                const paragraphs = section.split(/\n\s*\n/);
                paragraphs.forEach(para => {
                    para = para.trim();
                    if (!para) return;
                    
                    // Handle bold text within paragraphs
                    const p = document.createElement('p');
                    p.style.marginBottom = '1rem';
                    p.style.lineHeight = '1.6';
                    
                    // Split by bold markers and process
                    const parts = para.split(/\*\*(.*?)\*\*/g);
                    for (let j = 0; j < parts.length; j++) {
                        if (j % 2 === 0) {
                            // Regular text
                            if (parts[j]) {
                                const textNode = document.createTextNode(parts[j]);
                                p.appendChild(textNode);
                            }
                        } else {
                            // Bold text
                            const bold = document.createElement('strong');
                            bold.textContent = parts[j];
                            bold.style.color = '#4f46e5';
                            p.appendChild(bold);
                        }
                    }
                    
                    container.appendChild(p);
                });
            }
        }
        
        return container;
    }

    // Keep the old method for backward compatibility
    formatAnalysisToText(analysis) {
        // Secure text formatting without HTML injection risks
        let formatted = analysis;
        
        // Handle major section headings with plain text formatting
        formatted = formatted.replace(/\*\*(Complete Synopsis|Key Themes and Concepts|Chapter Outline|Critical Review|Who Should Read This|Key Takeaways)\*\*/gi, '\n\n=== $1 ===\n');
        
        // Handle any remaining **bold** text by converting to uppercase
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1');
        
        // Clean up multiple newlines and ensure proper spacing
        formatted = formatted.replace(/\n{3,}/g, '\n\n');
        formatted = formatted.trim();
        
        return formatted;
    }

    async validateBooksWithLLM(books) {
        if (books.length === 0) return [];
        
        const booksJson = JSON.stringify(books, null, 2);
        const prompt = `You are a book validation expert. Analyze the following book recommendations and determine which ones are REAL, EXISTING books vs fake/nonsensical content.

BOOKS TO VALIDATE:
${booksJson}

VALIDATION CRITERIA:
✅ KEEP books that are:
- Real published books with legitimate titles and authors
- Have reasonable descriptions that match the actual book
- Authors with proper names (even if uncommon)
- Titles that make sense for actual books

❌ REJECT books that are:
- Completely made-up or fake books
- Nonsensical titles like "s,fnsd lfkj" or random character sequences  
- Fake author names like "John Doe" or obvious placeholders
- Author names with excessive repetition or garbled text (e.g., "A. B. C. D. E. F. G. H..." with dozens of repeated names)
- Gibberish descriptions or content

IMPORTANT: Be generous with validation - only reject obvious fakes/gibberish. Many legitimate books have unusual titles or author names.

Respond with ONLY a JSON array of the VALID books (exact same format). If all books are valid, return all of them. If none are valid, return an empty array.`;

        try {
            const response = await fetch(CONFIG.API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': CONFIG.SITE_URL,
                    'X-Title': CONFIG.SITE_NAME
                },
                body: JSON.stringify({
                    model: this.config.MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.1,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                console.warn('LLM validation failed, using all books');
                return books; // Fall back to accepting all books if validation fails
            }

            const data = await response.json();
            const validationResponse = data.choices[0].message.content.trim();
            
            // Extract JSON array from response
            const jsonMatch = validationResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                try {
                    const validatedBooks = JSON.parse(jsonMatch[0]);
                    console.log(`LLM validation: ${validatedBooks.length}/${books.length} books validated as legitimate`);
                    return validatedBooks;
                } catch (parseError) {
                    console.error('LLM validation JSON parse error:', parseError);
                    console.warn('Could not parse LLM validation response, using all books');
                    return books; // Fall back to original books on parse error
                }
            } else {
                console.warn('Could not find JSON in LLM validation response, using all books');
                return books; // Fall back if can't parse response
            }
        } catch (error) {
            console.warn('LLM validation error, using all books:', error);
            return books; // Fall back to accepting all books on error
        }
    }

    async findBooksWithValidation(topic) {
        try {
            console.log('Searching for topic:', topic);
            const books = await this.getBookRecommendations(topic);
            console.log('API returned books:', books);
            const validBooks = await this.validateBooksWithLLM(books);
            console.log('Valid books after filtering:', validBooks);
            
            // Only show validation error if we got books but they were ALL fake/nonsensical
            if (books.length > 0 && validBooks.length === 0) {
                throw new Error('validation_failed');
            }
            
            // If no books returned at all from API, it's a general error
            if (books.length === 0) {
                throw new Error('no_books_returned');
            }
            
            if (validBooks.length < 3) {
                console.warn(`Only ${validBooks.length} valid books found out of ${books.length}`);
            }
            
            return validBooks;
        } catch (error) {
            console.error('Error in findBooksWithValidation:', error);
            if (error.message === 'validation_failed') {
                throw new Error('validation_failed');
            } else if (error.message === 'no_books_returned') {
                throw new Error('no_books_returned');
            } else if (error.message === 'ai_declined_nonsensical') {
                throw new Error('ai_declined_nonsensical');
            } else {
                throw new Error('api_error');
            }
        }
    }

    // Report action methods
    copyReportAsMarkdown() {
        if (this.currentBookIndex >= 0 && this.currentBooks[this.currentBookIndex]) {
            const book = this.currentBooks[this.currentBookIndex];
            let markdownContent = `# ${book.title}\n\n*by ${book.author}*\n\n`;
            
            if (book.analysis) {
                markdownContent += book.analysis;
            } else {
                markdownContent += 'Analysis not available.';
            }

            // Copy to clipboard
            navigator.clipboard.writeText(markdownContent).then(() => {
                this.showNotification('Report copied to clipboard!', 'success');
                this.trackEvent('report_copied', {
                    book_title: book.title,
                    book_author: book.author
                });
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = markdownContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('Report copied to clipboard!', 'success');
            });
        }
    }

    showSaveComingSoon() {
        this.showNotification('Save feature coming soon! For now, use Copy Report to save the content.', 'info');
        this.trackEvent('save_button_clicked');
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        this.trackEvent('scroll_to_top_clicked');
    }

    confirmNewSearch() {
        if (this.currentBooks.length > 0) {
            if (confirm('Start a new search? This will clear your current book recommendations.')) {
                this.showSearchSection();
            }
        } else {
            this.showSearchSection();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BookPeckersApp();

    // Add loading states to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled && !this.classList.contains('loading')) {
                this.classList.add('loading');
                this.style.opacity = '0.8';
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.style.opacity = '1';
                }, 500);
            }
        });
    });

    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animateOnScroll = document.querySelectorAll('.book-card, .report-card');
    animateOnScroll.forEach(el => {
        observer.observe(el);
    });

    // Add parallax effect to background
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const searchSection = document.querySelector('.search-section');
        
        if (searchSection && searchSection.style.display !== 'none') {
            const parallax = scrolled * 0.5;
            searchSection.style.transform = `translateY(${parallax}px)`;
        }
        
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
});