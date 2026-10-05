/**
 * VIGARISTA & Quentro Idle Background Preloader
 * Executes only during browser idle time AFTER the home screen is fully rendered.
 * Prevents mobile CPU/GPU spikes and network congestion on initial page load.
 */

const IDLE_BACKGROUND_ASSETS = [
  '/bts-poster-square.webp',
  '/bts-poster-full.webp',
];

const inMemoryDecodedImages: HTMLImageElement[] = [];

export function preloadCriticalImages(): void {
  if (typeof window === 'undefined') return;

  const runIdleWarmup = () => {
    // Sequentially preload and decode assets one by one during idle slices
    let index = 0;
    const preloadNext = () => {
      if (index >= IDLE_BACKGROUND_ASSETS.length) return;
      const src = IDLE_BACKGROUND_ASSETS[index++];

      try {
        const img = new Image();
        // Modern low priority hint to avoid stealing bandwidth from active user actions
        if ('fetchPriority' in img) {
          (img as unknown as { fetchPriority: string }).fetchPriority = 'low';
        }
        img.src = src;

        if ('decode' in img && typeof img.decode === 'function') {
          img
            .decode()
            .then(() => {
              inMemoryDecodedImages.push(img);
              setTimeout(preloadNext, 400);
            })
            .catch(() => {
              setTimeout(preloadNext, 400);
            });
        } else {
          img.onload = () => {
            inMemoryDecodedImages.push(img);
            setTimeout(preloadNext, 400);
          };
          img.onerror = () => {
            setTimeout(preloadNext, 400);
          };
        }
      } catch {
        setTimeout(preloadNext, 400);
      }
    };

    preloadNext();
  };

  // Wait 2.5s until initial screen has completely settled and painted before starting background cache
  if (typeof window.requestIdleCallback === 'function') {
    setTimeout(() => {
      window.requestIdleCallback(runIdleWarmup, { timeout: 3000 });
    }, 2000);
  } else {
    setTimeout(runIdleWarmup, 2500);
  }
}
