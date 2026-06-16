import './Input.css';

export function Input({ label, id, error, hint, required, ...props }) {
  return (
    <div className="input-field">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
          {required && <span className="input-required" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={id}
        className={`input-control ${error ? 'input-control--error' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        required={required}
        {...props}
      />
      {error && <span id={`${id}-error`} className="input-error" role="alert">{error}</span>}
      {hint && !error && <span id={`${id}-hint`} className="input-hint">{hint}</span>}
    </div>
  );
}
