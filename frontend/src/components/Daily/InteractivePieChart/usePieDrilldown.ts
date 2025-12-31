import { useState, useRef } from 'react';
import type { Activity } from '../../../types/activity';
import { hasSubcategories } from './interactivePieChart.utils';
import type { DrillLevel, ChartData } from './interactivePieChart.utils';
export const usePieDrilldown = (activities: Activity[]) => {
  const [drillLevel, setDrillLevel] = useState<DrillLevel>('category');
  const [drilldownCategory, setDrilldownCategory] = useState<string | null>(null);
  const [drilldownSubcategory, setDrilldownSubcategory] = useState<string | null>(null);
  
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());
  const [hiddenSubcategories, setHiddenSubcategories] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Selection and popover state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Touch tracking
  const touchStartTime = useRef<number>(0);
  const longPressTimeout = useRef<number | null>(null);
  const isTouchDevice = useRef<boolean>(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const closePopover = () => {
    setSelectedIndex(null);
    setPopoverPosition(null);
  };

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleZoomIn = (entry: ChartData) => {
    triggerAnimation();
    
    if (drillLevel === 'category') {
      const category = entry.category!;
      setDrilldownCategory(category);
      
      if (hasSubcategories(activities, category)) {
        setDrillLevel('subcategory');
      } else {
        setDrillLevel('activity');
      }
    } else if (drillLevel === 'subcategory') {
      setDrilldownSubcategory(entry.subcategory!);
      setDrillLevel('activity');
    }
    
    closePopover();
  };

  const handleHideItem = (entry: ChartData, displayDataLength: number) => {
    // Prevent hiding if it's the only visible slice
    if (displayDataLength === 1) {
      closePopover();
      return;
    }
    
    if (drillLevel === 'category') {
      setHiddenCategories(prev => new Set([...prev, entry.category!]));
    } else if (drillLevel === 'subcategory') {
      setHiddenSubcategories(prev => new Set([...prev, entry.subcategory!]));
    }
    
    closePopover();
  };

  const handleTouchStart = (_entry: ChartData) => {
    isTouchDevice.current = true;
    touchStartTime.current = Date.now();
    
    // Set up long press detection
    longPressTimeout.current = setTimeout(() => {
      // Long press detected - hide item
      if (drillLevel !== 'activity') {
        // Note: displayDataLength will be passed when called
        // This is a limitation - we'll handle it in the component
      }
    }, 500);
  };

  const handleTouchEnd = (entry: ChartData) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    
    const touchDuration = Date.now() - touchStartTime.current;
    
    // Short tap - zoom in
    if (touchDuration < 500 && drillLevel !== 'activity') {
      handleZoomIn(entry);
    }
  };

  const handlePieClick = (_entry: any, index: number, event: any) => {
    if (isTouchDevice.current) {
      return;
    }
    
    if (drillLevel === 'activity') {
      return;
    }

    const svg = event.currentTarget.closest('svg');
    const rect = svg.getBoundingClientRect();
    
    if (selectedIndex === index) {
      closePopover();
      return;
    }
    
    setSelectedIndex(index);
    setPopoverPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  const handleBackToCategories = () => {
    triggerAnimation();
    
    setDrillLevel('category');
    setDrilldownCategory(null);
    setDrilldownSubcategory(null);
    setHiddenCategories(new Set());
    setHiddenSubcategories(new Set());
    setActiveIndex(null);
    closePopover();
  };

  const handleBackToSubcategories = () => {
    triggerAnimation();
    
    setDrillLevel('subcategory');
    setDrilldownSubcategory(null);
    setHiddenSubcategories(new Set());
    closePopover();
  };

  return {
    // State
    drillLevel,
    drilldownCategory,
    drilldownSubcategory,
    hiddenCategories,
    hiddenSubcategories,
    activeIndex,
    selectedIndex,
    popoverPosition,
    isAnimating,
    isTouchDevice,
    
    // State setters
    setActiveIndex,
    
    // Actions
    handleZoomIn,
    handleHideItem,
    handleTouchStart,
    handleTouchEnd,
    handlePieClick,
    handleBackToCategories,
    handleBackToSubcategories,
    closePopover,
  };
};