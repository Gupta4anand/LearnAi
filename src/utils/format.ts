/**
 * Capitalizes the first letter of each word in a string.
 */
export const capitalizeName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Gets the initials of a name (max 2 characters).
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  const words = name.trim().split(' ').filter(word => word.length > 0);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};
