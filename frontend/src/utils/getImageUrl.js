// Builds the full URL to fetch an item's image from the backend.
// Usage: <img src={getImageUrl(item._id)} />
export const getImageUrl = (itemIdOrPath) => {
  if (!itemIdOrPath) return null;

  // If already a full URL, leave it alone
  if (typeof itemIdOrPath === 'string' && (itemIdOrPath.startsWith('http://') || itemIdOrPath.startsWith('https://'))) {
    return itemIdOrPath;
  }

  const base = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Check if the argument is a direct file path (e.g., "/uploads/filename.jpg")
  const isPath = typeof itemIdOrPath === 'string' && (itemIdOrPath.startsWith('/') || itemIdOrPath.includes('.'));

  if (isPath) {
    const backendRoot = base.replace(/\/api\/?$/, '');
    const separator = itemIdOrPath.startsWith('/') ? '' : '/';
    return `${backendRoot}${separator}${itemIdOrPath}`;
  }

  // Build endpoint using backend API root
  return `${base}/items/${itemIdOrPath}/image`;
};
