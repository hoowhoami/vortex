"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScrollableRowProps {
  children: React.ReactNode;
  scrollDistance?: number;
}

export function ScrollableRow({
  children,
  scrollDistance = 1000,
}: ScrollableRowProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = React.useState(false);
  const [showRightScroll, setShowRightScroll] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = containerRef.current;

      // Calculate if left/right scroll buttons are needed
      const threshold = 1; // Tolerance value to avoid floating point errors
      const canScrollRight =
        scrollWidth - (scrollLeft + clientWidth) > threshold;
      const canScrollLeft = scrollLeft > threshold;

      setShowRightScroll(canScrollRight);
      setShowLeftScroll(canScrollLeft);
    }
  }, []);

  React.useEffect(() => {
    checkScroll();

    // Listen for window resize
    window.addEventListener("resize", checkScroll);

    // Create ResizeObserver to monitor container size changes
    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", checkScroll);
      resizeObserver.disconnect();
    };
  }, [children, checkScroll]);

  // Monitor DOM changes
  React.useEffect(() => {
    if (containerRef.current) {
      const observer = new MutationObserver(() => {
        setTimeout(checkScroll, 100);
      });

      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      return () => observer.disconnect();
    }
  }, [checkScroll]);

  const handleScrollRightClick = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: scrollDistance,
        behavior: "smooth",
      });
    }
  };

  const handleScrollLeftClick = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -scrollDistance,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        setIsHovered(true);
        checkScroll();
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={containerRef}
        className="flex space-x-6 overflow-x-auto scrollbar-hide py-1 sm:py-2 pb-12 sm:pb-14 px-4 sm:px-6"
        onScroll={checkScroll}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>

      {/* Left scroll button */}
      {showLeftScroll && (
        <div
          className={`hidden sm:flex absolute left-0 top-0 bottom-0 w-16 items-center justify-center z-50 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "transparent",
            pointerEvents: "none",
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              top: "40%",
              bottom: "60%",
              left: "-4.5rem",
              pointerEvents: "auto",
            }}
          >
            <Button
              onClick={handleScrollLeftClick}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full shadow-lg hover:scale-105 transition-transform bg-background/95 hover:bg-background"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Right scroll button */}
      {showRightScroll && (
        <div
          className={`hidden sm:flex absolute right-0 top-0 bottom-0 w-16 items-center justify-center z-50 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "transparent",
            pointerEvents: "none",
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              top: "40%",
              bottom: "60%",
              right: "-4.5rem",
              pointerEvents: "auto",
            }}
          >
            <Button
              onClick={handleScrollRightClick}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full shadow-lg hover:scale-105 transition-transform bg-background/95 hover:bg-background"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
