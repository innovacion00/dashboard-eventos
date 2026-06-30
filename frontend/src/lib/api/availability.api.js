import { api } from './client.js';

export const availabilityApi = {
  check: (params) =>
    api.get('/availability?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))
    )),
};
