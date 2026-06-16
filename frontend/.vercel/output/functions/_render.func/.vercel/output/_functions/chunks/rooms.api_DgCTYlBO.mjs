import { a as api } from './Alert_AtUShQUE.mjs';

const roomsApi = {
  list: () => api.get('/rooms'),
};

export { roomsApi as r };
