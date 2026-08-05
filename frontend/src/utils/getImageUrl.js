/**
 * Resolves an item's image path to a full URL.
 *
 * The backend stores images as relative paths like "/uploads/filename.jpg".
 * We must prefix the backend's root URL — NOT the frontend's origin — so the
 * image loads from the correct server on any device on the local network.
 *
 * Priority order for the backend root:
 *  1. VITE_API_BASE_URL env var (with /api stripped)      ← set this in production
 *  2. Same hostname as the frontend, port 3000            ← works across local-network devices
 *  3. localhost:3000 (last resort, only valid on one machine)
 */
const getBackendRoot = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    // Strip trailing /api so we get the bare root, e.g. "http://host:3000"
    return envUrl.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    // Use the same hostname the browser is currently pointing at.
    // This is the key fix: if the user opens the app via 192.168.1.5:5173,
    // we build image URLs against 192.168.1.5:3000 — not localhost:3000.
    const { hostname, port } = window.location;
    // If the frontend shifted to port 5174 the backend likely shifted to 3001
    const backendPort = port === '5174' ? '3001' : '3000';
    return `http://${hostname}:${backendPort}`;
  }

  return 'http://localhost:3000';
};

const BACKEND_ROOT = getBackendRoot();

/**
 * @param {string | null | undefined} imagePath  - The path stored in the DB, e.g. "/uploads/abc.jpg"
 * @returns {string | null}  Full URL suitable for <img src={}>, or null if no image.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;  // Already a full URL, leave it alone
  }
  const separator = imagePath.startsWith('/') ? '' : '/';
  return `${BACKEND_ROOT}${separator}${imagePath}`;
};
