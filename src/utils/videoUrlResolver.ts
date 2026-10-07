/**
 * Video Asset URL Normalizer
 * Normalizes file pathing across development, production builds, and custom base URLs.
 * Correctly resolves assets written to public/ and dist/ by the Vite upload plugin.
 */

export function normalizeVideoAssetUrl(rawUrl: string | undefined | null, fallbackFilename: string): string {
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    rawUrl = `/${fallbackFilename}`;
  }

  const trimmed = rawUrl.trim();

  // If already an absolute protocol URL or Blob URL, preserve as-is
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Determine base path from Vite environment
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Separate path from query parameters/hash
  const [pathPart, ...queryParts] = trimmed.split('?');
  const queryString = queryParts.length > 0 ? `?${queryParts.join('?')}` : '';

  // Clean leading slashes
  const cleanPath = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;

  // If cleanPath already begins with cleanBase (and cleanBase is not empty), do not duplicate
  let resolvedPath = cleanPath;
  if (cleanBase && !cleanPath.startsWith(cleanBase)) {
    resolvedPath = `${cleanBase}${cleanPath}`;
  }

  // Ensure no duplicate double slashes (except in protocol)
  resolvedPath = resolvedPath.replace(/\/+/g, '/');

  return `${resolvedPath}${queryString}`;
}
