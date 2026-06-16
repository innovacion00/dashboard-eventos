import { useState } from 'react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { authApi } from '../../lib/api/auth.api.js';
import { saveSession } from '../../lib/auth/session.js';
import './LoginForm.css';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      saveSession(res.data.token, res.data.user);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-form-header">
        <div className="login-form-logo">◈</div>
        <h1 className="login-form-title">GEH Events</h1>
        <p className="login-form-subtitle">Sistema de Gestión Comercial — Hotel Windsor House</p>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="login-form-fields">
        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@gehsuites.com"
          required
          autoComplete="email"
          autoFocus
        />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" size="lg" loading={loading} style={{ width: '100%' }}>
        Iniciar sesión
      </Button>
    </form>
  );
}
