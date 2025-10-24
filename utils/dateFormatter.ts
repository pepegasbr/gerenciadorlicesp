const monthAbbreviations = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

/**
 * Formats a date string from 'YYYY-MM-DD' or ISO format to 'dd Mmm. YYYY'.
 * @param dateString The date string in 'YYYY-MM-DD' or ISO format.
 * @returns The formatted date string, e.g., '19 Mar. 2025'.
 */
export const formatDisplayDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  
  try {
    // Using new Date(year, monthIndex, day) is safer for avoiding timezone issues
    // than new Date('YYYY-MM-DD').
    const datePart = dateString.split('T')[0];
    const parts = datePart.split('-');
    
    if (parts.length !== 3) return dateString;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    // Check if the created date is valid and matches the input, which handles invalid inputs like '2023-02-30'
    if (isNaN(date.getTime()) || date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
        return dateString;
    }

    const monthAbbr = monthAbbreviations[date.getMonth()];

    return `${('0' + day).slice(-2)} ${monthAbbr}. ${year}`;
  } catch (error) {
    // Fallback to original string if parsing fails for any reason
    return dateString;
  }
};
