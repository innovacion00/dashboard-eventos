import './Alert.css';

export function Alert({ children, variant = 'info', onClose }) {
  return (
    <div className={`alert alert--${variant}`} role="alert">
      <span className="alert-content">{children}</span>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      )}
    </div>
  );
}
