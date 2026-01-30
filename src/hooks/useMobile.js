import { useState, useEffect, useCallback } from "react";

/**
 * Breakpoints matching iPhone dimensions
 * - iPhone SE: 375px
 * - iPhone 14: 390px
 * - iPhone 14 Pro Max: 430px
 * - iPad Mini: 768px
 */
const BREAKPOINTS = {
    mobile: 640, // < 640px = mobile
    tablet: 1024 // 640-1024px = tablet, > 1024px = desktop
};

/**
 * useMobile - Hook for responsive design detection
 * Returns device type and utility functions
 */
export function useMobile() {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== "undefined" ? window.innerWidth : 1024,
        height: typeof window !== "undefined" ? window.innerHeight : 768
    });

    // Debounced resize handler
    useEffect(() => {
        let timeoutId;

        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }, 100);
        };

        window.addEventListener("resize", handleResize);

        // Initial check
        handleResize();

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Device type detection
    const isMobile = windowSize.width < BREAKPOINTS.mobile;
    const isTablet =
        windowSize.width >= BREAKPOINTS.mobile &&
        windowSize.width < BREAKPOINTS.tablet;
    const isDesktop = windowSize.width >= BREAKPOINTS.tablet;

    // Touch device detection
    const isTouchDevice =
        typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    // Safe area insets (for notch/home indicator)
    const getSafeAreaInsets = useCallback(() => {
        if (typeof window === "undefined") {
            return { top: 0, bottom: 0, left: 0, right: 0 };
        }

        const style = getComputedStyle(document.documentElement);
        return {
            top: parseInt(style.getPropertyValue("--sat") || "0", 10),
            bottom: parseInt(style.getPropertyValue("--sab") || "0", 10),
            left: parseInt(style.getPropertyValue("--sal") || "0", 10),
            right: parseInt(style.getPropertyValue("--sar") || "0", 10)
        };
    }, []);

    return {
        // Device types
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,

        // Dimensions
        windowWidth: windowSize.width,
        windowHeight: windowSize.height,

        // Utilities
        getSafeAreaInsets,

        // Breakpoint values for reference
        breakpoints: BREAKPOINTS
    };
}

/**
 * useMediaQuery - Hook for custom media queries
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mediaQuery = window.matchMedia(query);

        const handler = (e) => setMatches(e.matches);
        mediaQuery.addEventListener("change", handler);

        return () => mediaQuery.removeEventListener("change", handler);
    }, [query]);

    return matches;
}
