import React, { useState, useEffect, useRef } from 'react';
import styles from './VectorSearch.module.css';

interface SearchResult {
  id: string;
  content: string;
  metadata: {
    source: string;
    title?: string;
    /** The live route, resolved server-side from frontmatter `slug` and
     *  repaired through data/redirects.json. Never derive this from `source`:
     *  the file path and the route differ for ~20% of articles. */
    url?: string;
  };
  distance: number;
}

/** Escape user input before it goes into a RegExp. Without this, a query like
 *  `c++`, `*` or `?` throws during render and takes the whole page down with
 *  it - including on load via /search?q=... */
const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Search backend is unreachable (ChromaDB / embedding API down). */
class SearchUnavailableError extends Error {}
/** The session cookie expired while the page was open. */
class SessionExpiredError extends Error {}

/** Longest query we'll send. The server caps this too; this just avoids a
 *  pointless round trip when someone pastes a document into the box. */
const MAX_QUERY_LENGTH = 500;

interface VectorSearchProps {
  placeholder?: string;
  onClose?: () => void;
  isModal?: boolean;
  /** Pre-fill the input and run the search once on mount. Used by the search
   *  page when arriving from the landing-page hero form (`/search?q=...`). */
  initialQuery?: string;
}

const VectorSearch: React.FC<VectorSearchProps> = ({
  placeholder = "Search documentation...",
  onClose,
  isModal = false,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const hasRunInitial = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSearchSeq = useRef(0);

  // Drop any in-flight debounce when the component goes away.
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // Run the search once on mount if an initial query was passed in.
  useEffect(() => {
    if (initialQuery && !hasRunInitial.current) {
      hasRunInitial.current = true;
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const searchAPI = async (searchQuery: string): Promise<SearchResult[]> => {
    // Use same-origin API call (no CORS issues)
    const API_BASE_URL = typeof window !== 'undefined'
      ? window.location.origin  // Same origin as the current site
      : '';

    const response = await fetch(`${API_BASE_URL}/api/vector/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: searchQuery, limit: 8 }),
    });

    // Distinguish "search is down" from "nothing matched" - rendering an
    // outage as "No results found" tells the user the article doesn't exist.
    if (response.status === 503) {
      throw new SearchUnavailableError();
    }
    if (response.status === 401) {
      throw new SessionExpiredError();
    }

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

    // Sequence guard: every search gets a ticket, and only the newest one is
    // allowed to write state. Without it a slow early request can land after a
    // fast later one and leave results for a prefix of what was typed.
    const seq = ++latestSearchSeq.current;

    setIsLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      const searchResults = await searchAPI(searchQuery.slice(0, MAX_QUERY_LENGTH));
      if (seq !== latestSearchSeq.current) return;
      setResults(searchResults);
    } catch (err) {
      if (seq !== latestSearchSeq.current) return;
      if (err instanceof SearchUnavailableError) {
        setError('Search is temporarily unavailable. Please try again in a moment.');
      } else if (err instanceof SessionExpiredError) {
        setError('Your session expired. Please sign in again to search.');
      } else {
        setError('Search failed. Please try again.');
      }
      setResults([]);
    } finally {
      if (seq === latestSearchSeq.current) setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce. The previous version returned a cleanup function from the
    // event handler - React discards that, so the timer was never cleared and
    // every keystroke fired its own search (and its own OpenAI embedding call).
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleResultClick = (result: SearchResult) => {
    // Navigate using the URL the server resolved for us. This used to rebuild
    // the path from result.metadata.source, which sent 68 of 333 articles to
    // "Page Not Found" - Docusaurus routes by frontmatter `slug`, not by
    // filename. The server already validated this URL against the live route
    // set (server.js -> resolveCitationUrl), so a missing one means the
    // article isn't reachable and we should not guess.
    const url = result.metadata.url;
    if (url) {
      window.location.assign(window.location.origin + url);
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

    let parts: string[];
    try {
      parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    } catch {
      // Belt and braces: highlighting is decorative, never worth a blank page.
      return <>{text}</>;
    }
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