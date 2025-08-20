import { useState, useRef, useCallback } from 'react';

export const useDatePicker = () => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState({ x: 0, y: 0 });
  const datePickerCallbackRef = useRef<((date: string) => void) | null>(null);

  const openDatePicker = useCallback((position: { x: number; y: number }, callback: (date: string) => void) => {
    setDatePickerPosition(position);
    datePickerCallbackRef.current = callback;
    setDatePickerOpen(true);
  }, []);

  const closeDatePicker = useCallback(() => {
    setDatePickerOpen(false);
    datePickerCallbackRef.current = null;
  }, []);

  const handleDateSelect = useCallback((date: string) => {
    if (datePickerCallbackRef.current) {
      datePickerCallbackRef.current(date);
    }
    closeDatePicker();
  }, [closeDatePicker]);

  return {
    datePickerOpen,
    datePickerPosition,
    datePickerCallbackRef,
    openDatePicker,
    closeDatePicker,
    handleDateSelect,
    setDatePickerOpen,
    setDatePickerPosition
  };
};
