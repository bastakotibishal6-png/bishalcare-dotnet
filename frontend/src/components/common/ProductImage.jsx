import React, { useEffect, useRef, useState } from 'react';
import './ProductImage.css';

// 1x1 transparent GIF: shown while waiting to retry, so no broken-image icon flashes
const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Neutral placeholder shown when an image is missing or cannot be loaded
const FALLBACK_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
    '<rect width="400" height="400" fill="#f5f0e9"/>' +
    '<g fill="none" stroke="#b8ab9c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="176" y="128" width="48" height="26" rx="4"/>' +
    '<path d="M186 154v16M214 154v16"/>' +
    '<rect x="154" y="170" width="92" height="112" rx="16"/>' +
    '<path d="M154 218h92"/>' +
    '</g></svg>'
)}`;

const RETRY_DELAY_MS = 500;

const withRetryParam = (url) =>
  `${url}${url.includes('?') ? '&' : '?'}retry=${Date.now()}`;

function ProductImage({ src, alt, className, style, loading = 'lazy', ...rest }) {
  // phase: 'loading' | 'waiting' (before retry) | 'loaded' | 'failed'
  const [state, setState] = useState({
    src,
    phase: src ? 'loading' : 'failed',
    attempt: 0,
    retryUrl: null,
  });
  const retryTimer = useRef(null);

  // Reset when a new product image is passed in (e.g. filtering / pagination)
  let current = state;
  if (state.src !== src) {
    current = {
      src,
      phase: src ? 'loading' : 'failed',
      attempt: 0,
      retryUrl: null,
    };
    setState(current);
  }

  // Clear any pending retry when src changes or the component unmounts
  useEffect(() => () => clearTimeout(retryTimer.current), [src]);

  const { phase, attempt, retryUrl } = current;

  const handleLoad = () => {
    if (phase === 'loading') {
      setState((s) => ({ ...s, phase: 'loaded' }));
    }
  };

  const handleError = () => {
    if (phase !== 'loading') return; // ignore events from placeholder images

    if (attempt === 0) {
      // Same behaviour as before: retry once after 500ms with a cache-buster
      setState((s) => ({ ...s, phase: 'waiting' }));
      retryTimer.current = setTimeout(() => {
        setState((s) =>
          s.src === src
            ? { ...s, phase: 'loading', attempt: 1, retryUrl: withRetryParam(src) }
            : s
        );
      }, RETRY_DELAY_MS);
    } else {
      setState((s) => ({ ...s, phase: 'failed' }));
    }
  };

  const displaySrc =
    phase === 'failed'
      ? FALLBACK_SRC
      : phase === 'waiting'
      ? TRANSPARENT_PIXEL
      : attempt === 0
      ? src
      : retryUrl;

  const stateClass =
    phase === 'loading' || phase === 'waiting'
      ? 'product-img--loading'
      : phase === 'failed'
      ? 'product-img--failed'
      : '';

  const classes = [className, stateClass].filter(Boolean).join(' ');

  return (
    <img
      {...rest}
      src={displaySrc}
      alt={alt}
      className={classes || undefined}
      style={style}
      loading={loading}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

export default ProductImage;