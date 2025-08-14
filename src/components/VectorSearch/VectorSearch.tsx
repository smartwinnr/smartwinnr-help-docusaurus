import React, { useState, useEffect, useRef } from 'react';
import styles from './VectorSearch.module.css';

interface SearchResult {
  id: string;
  content: string;
  metadata: {
    source: string;
    title?: string;
  };
  distance: number;
}

interface VectorSearchProps {
  placeholder?: string;
  onClose?: () => void;
  isModal?: boolean;
}

const VectorSearch: React.FC<VectorSearchProps> = ({ 
  placeholder = "Search documentation...", 
  onClose,
  isModal = false 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchAPI = async (searchQuery: string): Promise<SearchResult[]> => {
    const response = await fetch('http://localhost:3002/api/vector/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: searchQuery, limit: 8 }),
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    return data.results || [];
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      const searchResults = await searchAPI(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the source document
    const source = result.metadata.source;
    if (source) {
      // Convert file path to URL path - source should be like "quizzes/understanding-knowledge-categories.md"
      let urlPath = '/' + source.replace(/\.md$/, ''); // Add leading slash and remove .md extension
      
      // Handle index.md files - remove /index from the end
      if (urlPath.endsWith('/index')) {
        urlPath = urlPath.replace('/index', '');
      }
      
      // Ensure we don't have double slashes and handle root case
      urlPath = urlPath.replace(/\/+/g, '/');
      if (urlPath === '' || urlPath === '/') urlPath = '/';
      
      console.log('Navigating to:', urlPath); // Debug log
      
      // Use window.location.assign for proper navigation that doesn't cause URL duplication
      // This ensures we navigate to the absolute URL correctly
      window.location.assign(window.location.origin + urlPath);
    }
    
    setIsOpen(false);
    setQuery('');
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      onClose?.();
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const highlightText = (text: string, query: string): JSX.Element => {
    if (!query.trim()) return <>{text}</>;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className={styles.highlight}>{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const cleanMarkdownContent = (content: string): string => {
    return content
      // Remove markdown headers
      .replace(/#{1,6}\s+/g, '')
      // Remove markdown bold/italic
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      // Remove markdown links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown lists
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  const truncateContent = (content: string, maxLength: number = 150): string => {
    const cleanContent = cleanMarkdownContent(content);
    if (cleanContent.length <= maxLength) return cleanContent;
    return cleanContent.substring(0, maxLength) + '...';
  };

  return (
    <div ref={searchRef} className={`${styles.searchContainer} ${isModal ? styles.modal : ''}`}>
      <div className={styles.searchInput}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className={styles.clearButton}
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div className={styles.resultsContainer}>
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              Searching...
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {!isLoading && !error && results.length === 0 && query && (
            <div className={styles.noResults}>
              No results found for "{query}"
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div className={styles.results}>
              <div className={styles.resultsHeader}>
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((result, index) => (
                <div
                  key={result.id || index}
                  className={styles.resultItem}
                  onClick={() => handleResultClick(result)}
                >
                  <div className={styles.resultTitle}>
                    {result.metadata.title || 
                     result.metadata.source.replace(/^docs\//, '').replace(/\/index\.md$/, '').replace(/\.md$/, '')}
                  </div>
                  <div className={styles.resultContent}>
                    {highlightText(truncateContent(result.content), query)}
                  </div>
                  <div className={styles.resultMeta}>
                    <span className={styles.resultSource}>
                      {result.metadata.source.replace(/^docs\//, '').replace(/\.md$/, '')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VectorSearch;