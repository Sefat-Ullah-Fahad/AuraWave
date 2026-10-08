/**
 * Secure API client:
 * Zero browser localStorage usage.
 * Authentication state is maintained strictly via secure HTTP-Only cookies
 * which cannot be read, stolen, or accessed by client-side JavaScript or XSS.
 */

export async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // Automatically passes secure HTTP-Only session cookies
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
