/**
 * Debounce Utility
 *
 * Purpose: Limits the frequency of function calls to improve performance
 *
 * Features:
 * - Delays function execution until after a specified wait time
 * - Cancels previous calls if new calls are made within the wait time
 * - Useful for auto-save functionality to prevent excessive writes
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */

import { ProjectStructure } from '../types/structure';

export function debounce<T extends (...args: ProjectStructure[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
