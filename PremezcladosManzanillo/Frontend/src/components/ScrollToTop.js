import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Disable browser's default scroll restoration to avoid conflict
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
