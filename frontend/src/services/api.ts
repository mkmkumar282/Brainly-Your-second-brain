const API_BASE_URL = 'http://localhost:3000';

function getHeaders() {
  const token = localStorage.getItem('brainly-token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = token;
    headers['token'] = token;
  }
  return headers;
}

export async function signup(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Signup failed');
  }
  return res.json();
}

export async function signin(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Signin failed');
  }
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('brainly-token', data.token);
    localStorage.setItem('brainly-username', username);
  }
  return data;
}

export function logout() {
  localStorage.removeItem('brainly-token');
  localStorage.removeItem('brainly-username');
}

export function getUsername() {
  return localStorage.getItem('brainly-username');
}

export function isAuthenticated() {
  return !!localStorage.getItem('brainly-token');
}

export async function addContent(params: {
  title: string;
  type: string;
  link?: string;
  description?: string;
  tags?: string[];
}) {
  const res = await fetch(`${API_BASE_URL}/content`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to add content');
  }
  return res.json();
}

export async function getContent() {
  const res = await fetch(`${API_BASE_URL}/content`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch content');
  }
  return res.json();
}

export async function deleteContent(contentId: string) {
  const res = await fetch(`${API_BASE_URL}/content`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ contentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete content');
  }
  return res.json();
}

export async function getShareStatus() {
  const res = await fetch(`${API_BASE_URL}/share`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) {
    // Not sharing if the request fails
    return { isSharing: false, hash: null };
  }
  return res.json(); // returns { isSharing: boolean, hash: string | null }
}

export async function toggleShare(share: boolean) {
  const res = await fetch(`${API_BASE_URL}/share`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ share }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to toggle share');
  }
  return res.json(); // returns { hash } or { message }
}

export async function getSharedContent(hash: string) {
  const res = await fetch(`${API_BASE_URL}/${hash}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch shared content');
  }
  return res.json(); // returns { username, content: [] }
}
