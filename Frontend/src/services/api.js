const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

export const api = {
  get:    (url)        => fetch(`${BASE_URL}${url}`, { headers: headers() }).then(r => r.json()),
  post:   (url, body)  => fetch(`${BASE_URL}${url}`, { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  patch:  (url, body)  => fetch(`${BASE_URL}${url}`, { method: 'PATCH',  headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  delete: (url)        => fetch(`${BASE_URL}${url}`, { method: 'DELETE', headers: headers() }).then(r => r.json()),
};