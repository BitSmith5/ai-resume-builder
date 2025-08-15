import { useState, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';

interface UseDragAndDropProps {
  sectionOrder: string[];
  setSectionOrder: (order: string[]) => void;
  onSectionOrderChange?: (newOrder: string[]) => void;
}

export const useDragAndDrop = ({ 
  sectionOrder, 
  setSectionOrder, 
  onSectionOrderChange 
}: UseDragAndDropProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragUpdate = useCallback(() => {
    // Optional: Add any drag update logic here
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    setIsDragging(false);

    if (!result.destination) {
      return;
    }

    if (result.type === 'main-section') {
      const newOrder = Array.from(sectionOrder);
      const [reorderedItem] = newOrder.splice(result.source.index, 1);
      newOrder.splice(result.destination.index, 0, reorderedItem);
      
      setSectionOrder(newOrder);
      onSectionOrderChange?.(newOrder);
    } else if (result.type === 'section') {
      const newOrder = Array.from(sectionOrder);
      const [reorderedItem] = newOrder.splice(result.source.index, 1);
      newOrder.splice(result.destination.index, 0, reorderedItem);
      
      setSectionOrder(newOrder);
      onSectionOrderChange?.(newOrder);
    }
  }, [sectionOrder, setSectionOrder, onSectionOrderChange]);

  return {
    isDragging,
    handleDragStart,
    handleDragUpdate,
    handleDragEnd
  };
};
