const rawApiBaseUrl = import.meta.env.VITE_API_URL || '';
const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '');

export const buildApiUrl = (path = '') => {
  if (!path) {
    return apiBaseUrl;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
};
