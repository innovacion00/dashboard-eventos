import './Input.css';

export function Select({ label, id, error, required, options = [], placeholder, ...props }) {
  return (
    <div className="input-field">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
          {required && <span className="input-required" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={id}
        className={`input-control ${error ? 'input-control--error' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="input-error" role="alert">{error}</span>}
    </div>
  );
}
