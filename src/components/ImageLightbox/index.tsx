import React, {useCallback, useEffect, useState} from 'react';

/**
 * Click-to-zoom for article images. Mounted once globally from Root.tsx.
 *
 * Uses a single delegated click listener on the document so it covers every
 * image inside the article body (`.theme-doc-markdown`) without swizzling the
 * MDX `img` component or touching individual articles. Clicking an image opens
 * it in a full-screen overlay; click the backdrop, the close button, or press
 * Escape to dismiss. Images wrapped in a link keep their link behavior.
 *
 * The overlay renders inline (a fixed-position element) rather than through a
 * portal: Root.tsx mounts this at the very top of the tree, so there is no
 * transformed ancestor to trap `position: fixed`, and we avoid pulling in
 * `react-dom` types just for createPortal.
 */

type Zoomed = {src: string; alt: string} | null;

export default function ImageLightbox(): React.JSX.Element | null {
  const [img, setImg] = useState<Zoomed>(null);

  // One delegated listener for all article-body images.
  useEffect(() => {
    injectStyle();
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target || target.tagName !== 'IMG') return;
      if (!target.closest('.theme-doc-markdown')) return; // article body only
      if (target.closest('a')) return; // respect linked images
      const el = target as HTMLImageElement;
      const src = el.currentSrc || el.src;
      if (!src) return;
      e.preventDefault();
      setImg({src, alt: el.alt || ''});
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const close = useCallback(() => setImg(null), []);

  // While open: Escape closes, and body scroll is locked behind the overlay.
  useEffect(() => {
    if (!img) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [img, close]);

  if (typeof document === 'undefined' || !img) return null;

  return (
    <div
      className="sw-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={img.alt || 'Image preview'}
      onClick={close}>
      <button type="button" className="sw-lightbox-close" aria-label="Close image preview" onClick={close}>
        &times;
      </button>
      <figure className="sw-lightbox-figure" onClick={(e) => e.stopPropagation()}>
        <img className="sw-lightbox-img" src={img.src} alt={img.alt} />
        {img.alt ? <figcaption className="sw-lightbox-caption">{img.alt}</figcaption> : null}
      </figure>
    </div>
  );
}

// Injected once on the client - keeps the overlay + the hover affordance in one
// place without a separate CSS module (mirrors the pattern in
// src/components/Landing/RecommendedModules.tsx).
function injectStyle(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('sw-lightbox-style')) return;
  const s = document.createElement('style');
  s.id = 'sw-lightbox-style';
  s.textContent = `
    /* Affordance: article-body images look clickable. */
    .theme-doc-markdown img:not(a img) {
      cursor: zoom-in;
    }
    .sw-lightbox {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(16px, 4vw, 48px);
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(2px);
      cursor: zoom-out;
      animation: sw-lightbox-in 0.15s ease-out;
    }
    @keyframes sw-lightbox-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .sw-lightbox-figure {
      margin: 0;
      max-width: 100%;
      max-height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      cursor: default;
    }
    .sw-lightbox-img {
      max-width: 95vw;
      max-height: 85vh;
      object-fit: contain;
      border-radius: 6px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
      background: #fff;
    }
    .sw-lightbox-caption {
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.85rem;
      line-height: 1.4;
      text-align: center;
      max-width: 70ch;
    }
    .sw-lightbox-close {
      position: fixed;
      top: 16px;
      right: 20px;
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      font-size: 28px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.15s ease;
    }
    .sw-lightbox-close:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    @media (prefers-reduced-motion: reduce) {
      .sw-lightbox { animation: none; }
    }
  `;
  document.head.appendChild(s);
}
