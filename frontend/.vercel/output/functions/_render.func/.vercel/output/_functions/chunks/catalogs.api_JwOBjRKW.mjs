import { a as api } from './Alert_AtUShQUE.mjs';

const catalogsApi = {
  list: (type) => api.get(`/catalogs?type=${type}`),
};

export { catalogsApi as c };
