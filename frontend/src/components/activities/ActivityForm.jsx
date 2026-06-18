import { useState, useEffect, useRef } from 'react';
import { activitiesApi } from '../../lib/api/activities.api.js';
import { catalogsApi } from '../../lib/api/catalogs.api.js';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import './ActivityForm.css';

const ACCEPTED = '.jpg,.jpeg,.png,.gif,.webp,.pdf';
const MAX_SIZE_MB = 10;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ActivityForm({ companyId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    type: '', result: '', date: new Date().toISOString().slice(0, 16),
    nextActionDescription: '', nextActionAt: '',
  });
  const [types, setTypes] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    catalogsApi.list('ACTIVITY_TYPE').then((res) => {
      setTypes((res.data || []).map((c) => ({ value: c.code, label: c.label })));
    }).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function handleFileChange(e) {
    const selected = Array.from(e.target.files || []);
    const oversized = selected.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      setFileError(`Los siguientes archivos superan ${MAX_SIZE_MB}MB: ${oversized.map((f) => f.name).join(', ')}`);
      return;
    }
    if (files.length + selected.length > 10) {
      setFileError('Máximo 10 archivos por actividad');
      return;
    }
    setFileError('');
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const validate = () => {
    const err = {};
    if (!form.type) err.type = 'El tipo es obligatorio';
    if (!form.result.trim()) err.result = 'El resultado es obligatorio';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setApiError('');
      const payload = {
        companyId,
        type: form.type,
        result: form.result,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        nextActionDescription: form.nextActionDescription || undefined,
        nextActionAt: form.nextActionAt ? new Date(form.nextActionAt).toISOString() : undefined,
      };
      await activitiesApi.create(payload, files);
      onSaved();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} />}
      <Select id="type" label="Tipo de actividad" value={form.type} onChange={set('type')} options={types} placeholder="Selecciona el tipo" error={errors.type} required />
      <Input id="date" label="Fecha y hora" type="datetime-local" value={form.date} onChange={set('date')} />
      <div className="input-field">
        <label className="input-label" htmlFor="result">Resultado <span className="input-required">*</span></label>
        <textarea id="result" className={`input-control ${errors.result ? 'input-control--error' : ''}`} rows={3} value={form.result} onChange={set('result')} />
        {errors.result && <span className="input-error" role="alert">{errors.result}</span>}
      </div>
      <Input id="nextActionDescription" label="Descripción próxima acción" value={form.nextActionDescription} onChange={set('nextActionDescription')} />
      <Input id="nextActionAt" label="Fecha próxima acción" type="datetime-local" value={form.nextActionAt} onChange={set('nextActionAt')} />

      <div className="input-field">
        <label className="input-label">Evidencias</label>
        <div className="af-dropzone" onClick={() => fileInputRef.current?.click()}>
          <span className="af-dropzone-icon">📎</span>
          <span>Haz clic para adjuntar archivos</span>
          <span className="af-dropzone-hint">Imágenes o PDF · máx. {MAX_SIZE_MB}MB por archivo · máx. 10 archivos</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {fileError && <span className="input-error" role="alert">{fileError}</span>}
        {files.length > 0 && (
          <ul className="af-file-list">
            {files.map((f, i) => (
              <li key={i} className="af-file-item">
                <span className="af-file-name" title={f.name}>{f.name}</span>
                <span className="af-file-size">{formatSize(f.size)}</span>
                <button type="button" className="af-file-remove" onClick={() => removeFile(i)} aria-label="Eliminar">×</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Registrar actividad</Button>
      </div>
    </form>
  );
}
