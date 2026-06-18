import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { companiesApi } from '../../lib/api/companies.api.js';
import { Button } from '../ui/Button.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Modal } from '../ui/Modal.jsx';

const VALID_STATUSES = new Set(['PROSPECTO', 'CLIENTE_ACTIVO', 'CLIENTE_INACTIVO', 'ALIADO', 'AGENCIA', 'GUBERNAMENTAL']);

const COL_MAP = {
  nombre: 'name',
  segmento: 'segment',
  estado: 'status',
  contacto: 'contactName',
  cargo: 'contactPosition',
  telefono: 'phone',
  correo: 'email',
  direccion: 'address',
};

function normalizeKey(k) {
  return k
    .replace(/^﻿/, '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '')
    .trim();
}

function parseRows(rawRows) {
  return rawRows.map((raw, i) => {
    const norm = {};
    for (const [k, v] of Object.entries(raw)) {
      norm[normalizeKey(k)] = v;
    }

    const row = { _rowIndex: i + 2, _errors: [] };

    for (const [colKey, fieldKey] of Object.entries(COL_MAP)) {
      const val = norm[colKey];
      if (val !== undefined && val !== '') row[fieldKey] = String(val).trim();
    }

    if (row.status) {
      const upper = row.status.toUpperCase();
      if (VALID_STATUSES.has(upper)) row.status = upper;
      else delete row.status;
    }

    if (row.email && !row.email.includes('@')) delete row.email;

    if (!row.name || row.name.length < 2) row._errors.push('nombre faltante o muy corto');
    if (!row.segment) row._errors.push('segmento faltante');

    return row;
  });
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['NOMBRE', 'SEGMENTO', 'ESTADO', 'CONTACTO', 'CARGO', 'TELEFONO', 'CORREO', 'DIRECCION'],
    ['Hotel Example', 'Corporativo', 'PROSPECTO', 'Juan Pérez', 'Gerente General', '3001234567', 'juan@example.com', 'Calle 123 #45-67, Bogotá'],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Empresas');
  XLSX.writeFile(wb, 'plantilla_empresas.xlsx');
}

export function CompanyImport({ onImported }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const validRows = rows.filter(r => r._errors.length === 0);
  const invalidRows = rows.filter(r => r._errors.length > 0);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setError('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const allRows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const rawRows = allRows.filter(r => Object.values(r).some(v => String(v).trim() !== ''));
        if (rawRows.length === 0) { setError('El archivo está vacío o no tiene filas de datos.'); return; }
        if (rawRows.length > 5000) { setError('El archivo supera el límite de 5000 filas.'); return; }
        setRows(parseRows(rawRows));
        setOpen(true);
      } catch {
        setError('No se pudo leer el archivo. Asegúrese de que sea un .xlsx válido.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  }

  async function handleImport() {
    if (validRows.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const payload = validRows.map(({ _rowIndex, _errors, ...rest }) => rest);
      const res = await companiesApi.importCompanies(payload);
      setResult(res.data);
      setRows([]);
      onImported?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setRows([]);
    setResult(null);
    setError('');
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          type="button"
          className="link-btn"
          style={{ fontSize: 'var(--text-sm)' }}
          onClick={downloadTemplate}
        >
          Descargar plantilla
        </button>
        <Button onClick={() => fileRef.current?.click()}>
          Importar Excel
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <Modal open={open} title="Vista previa de importación" size="lg" onClose={handleClose}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {result ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
              <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)', color: 'var(--color-success)' }}>
                ✓ {result.imported} {result.imported === 1 ? 'empresa importada' : 'empresas importadas'}
              </p>
              <Button onClick={handleClose} style={{ marginTop: 'var(--space-4)' }}>Cerrar</Button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 'var(--font-medium)' }}>
                  ✓ {validRows.length} listas para importar
                </span>
                {invalidRows.length > 0 && (
                  <span style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-medium)' }}>
                    ✗ {invalidRows.length} con errores (no se importarán)
                  </span>
                )}
              </div>

              <div style={{ overflowX: 'auto', maxHeight: 360, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-gray-1)', position: 'sticky', top: 0 }}>
                      <th style={TH}>Fila</th>
                      <th style={TH}>Nombre</th>
                      <th style={TH}>Segmento</th>
                      <th style={TH}>Estado</th>
                      <th style={TH}>Contacto</th>
                      <th style={TH}>Cargo</th>
                      <th style={TH}>Teléfono</th>
                      <th style={TH}>Correo</th>
                      <th style={TH}>Dirección</th>
                      <th style={TH}>Errores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r._rowIndex}
                        style={{ background: r._errors.length > 0 ? 'var(--color-danger-bg)' : undefined }}
                      >
                        <td style={TD}>{r._rowIndex}</td>
                        <td style={TD}>{r.name || <span className="text-danger">—</span>}</td>
                        <td style={TD}>{r.segment || <span className="text-danger">—</span>}</td>
                        <td style={TD}>{r.status || 'PROSPECTO'}</td>
                        <td style={TD}>{r.contactName || '—'}</td>
                        <td style={TD}>{r.contactPosition || '—'}</td>
                        <td style={TD}>{r.phone || '—'}</td>
                        <td style={TD}>{r.email || '—'}</td>
                        <td style={TD}>{r.address || '—'}</td>
                        <td style={{ ...TD, color: 'var(--color-danger)' }}>
                          {r._errors.length > 0 ? r._errors.join(', ') : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="form-actions">
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button onClick={handleImport} disabled={loading || validRows.length === 0}>
                  {loading ? 'Importando...' : `Importar ${validRows.length} empresa${validRows.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

const TH = {
  padding: '6px 8px',
  textAlign: 'left',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text)',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap',
};

const TD = {
  padding: '5px 8px',
  borderBottom: '1px solid var(--color-gray-1)',
  verticalAlign: 'middle',
};
