import React, { useState, useEffect } from 'react';
import VectorSearch from '@site/src/components/VectorSearch/VectorSearch';
import './styles.css';

export default function SearchBar(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openModal();
      }
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="navbar__search">
        <button 
          className="navbar__search-button"
          onClick={openModal}
          aria-label="Search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <span className="navbar__search-text">Search docs...</span>
          <kbd className="navbar__search-key">⌘K</kbd>
        </button>
      </div>
      
      {isModalOpen && (
        <div className="search-modal-overlay" onClick={closeModal}>
          <div className="search-modal-content" onClick={e => e.stopPropagation()}>
            <div className="search-modal-header">
              <h3>Search Documentation</h3>
              <button className="search-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="search-modal-body">
              <VectorSearch 
                placeholder="Ask anything about SmartWinnr..." 
                onClose={closeModal}
                isModal={true}
              />
            </div>
            <div className="search-modal-footer">
              <div className="search-modal-tips">
                <span>💡 Try: "How to create a quiz?" or "Setting up competitions"</span>
              </div>
              <div className="search-modal-shortcuts">
                <kbd>↵</kbd> to select • <kbd>↑↓</kbd> to navigate • <kbd>esc</kbd> to close
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}