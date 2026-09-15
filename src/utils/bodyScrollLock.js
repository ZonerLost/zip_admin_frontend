let lockCount = 0;
let restoreScrollLock = null;

function isScrollableElement(element) {
  if (!(element instanceof HTMLElement)) return false;

  const style = window.getComputedStyle(element);
  const overflowValue = `${style.overflow} ${style.overflowY} ${style.overflowX}`;
  const hasScrollableOverflow = /(auto|scroll|overlay)/.test(overflowValue);

  return hasScrollableOverflow && element.scrollHeight > element.clientHeight;
}

function resolveScrollElement() {
  let current =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

  while (current) {
    if (isScrollableElement(current)) {
      return current;
    }
    current = current.parentElement;
  }

  return document.scrollingElement || document.documentElement;
}

export function lockBodyScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  lockCount += 1;

  if (lockCount === 1) {
    const root = document.documentElement;
    const body = document.body;
    const scrollElement = resolveScrollElement();
    const isPageScrollElement =
      scrollElement === body ||
      scrollElement === root ||
      scrollElement === document.scrollingElement;
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);

    const previousStyles = {
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      rootOverflow: root.style.overflow,
      scrollElement,
      scrollElementOverflow: scrollElement.style.overflow,
      scrollTop: scrollElement.scrollTop,
      scrollLeft: scrollElement.scrollLeft,
    };

    if (isPageScrollElement) {
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      scrollElement.style.overflow = "hidden";
    }

    restoreScrollLock = () => {
      if (isPageScrollElement) {
        root.style.overflow = previousStyles.rootOverflow;
        body.style.overflow = previousStyles.bodyOverflow;
        body.style.paddingRight = previousStyles.bodyPaddingRight;
      } else {
        previousStyles.scrollElement.style.overflow =
          previousStyles.scrollElementOverflow;
      }

      previousStyles.scrollElement.scrollTop = previousStyles.scrollTop;
      previousStyles.scrollElement.scrollLeft = previousStyles.scrollLeft;
    };
  }

  return () => {
    if (lockCount === 0) return;

    lockCount -= 1;

    if (lockCount === 0) {
      restoreScrollLock?.();
      restoreScrollLock = null;
    }
  };
}
