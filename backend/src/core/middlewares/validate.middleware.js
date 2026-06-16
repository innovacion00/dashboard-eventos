import { ValidationError } from '../errors/ValidationError.js';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.slice(1).join('.'),
        issue: e.message,
      }));
      return next(new ValidationError('Los datos enviados no son válidos', details));
    }

    // Sobrescribir con los datos validados/transformados
    req.body = result.data.body ?? req.body;
    req.query = result.data.query ?? req.query;
    req.params = result.data.params ?? req.params;

    return next();
  };
}
