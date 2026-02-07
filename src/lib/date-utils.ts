/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Formats a date and time string for display
 * Shows "Today at HH:MM", "Tomorrow at HH:MM", or full date with time
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timeStr - Time string in HH:MM format
 * @returns Formatted date and time string
 */
export function formatDate(dateStr: string, timeStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today at ${timeStr}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${timeStr}`;
  } else {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    };
    return `${date.toLocaleDateString('en-US', options)} at ${timeStr}`;
  }
}
