import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-ea69f32e`;

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });
  
  return response.json();
}

export async function login(username: string, password: string) {
  return apiCall('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username: string, password: string, name: string) {
  return apiCall('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, name }),
  });
}

export async function getPendingUsers() {
  return apiCall('/pending-users');
}

export async function verifyUser(username: string) {
  return apiCall('/verify-user', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function rejectUser(username: string) {
  return apiCall('/reject-user', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function getUsers() {
  return apiCall('/users');
}

export async function updateProgress(username: string, data: any) {
  return apiCall('/update-progress', {
    method: 'POST',
    body: JSON.stringify({ username, ...data }),
  });
}

export async function updateAdmin(role: string, password: string) {
  return apiCall('/update-admin', {
    method: 'POST',
    body: JSON.stringify({ role, password }),
  });
}

export async function uploadProfile(username: string, imageData: string) {
  return apiCall('/upload-profile', {
    method: 'POST',
    body: JSON.stringify({ username, imageData }),
  });
}

export async function submitAppeal(username: string, message: string) {
  return apiCall('/submit-appeal', {
    method: 'POST',
    body: JSON.stringify({ username, message }),
  });
}

export async function getPendingAppeals() {
  return apiCall('/pending-appeals');
}

export async function approveAppeal(username: string) {
  return apiCall('/approve-appeal', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}
