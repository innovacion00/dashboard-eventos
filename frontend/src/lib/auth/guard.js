import { isAuthenticated, clearSession } from './session.js';

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return false;
  }
  return true;
}

export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = '/dashboard';
    return true;
  }
  return false;
}

export function handleUnauthorized() {
  clearSession();
  window.location.href = '/login';
}
