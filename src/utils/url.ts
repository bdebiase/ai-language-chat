export const constructApiUrl = (baseUrl: string, path: string): string => {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${cleanBaseUrl}/${cleanPath}`;
};
