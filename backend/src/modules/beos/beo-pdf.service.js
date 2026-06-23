import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, '../../assets/logo-windsor.png');

function toBase64DataUrl(filePath, mime = 'image/png') {
  try {
    const buf = fs.readFileSync(filePath);
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch { return ''; }
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

function fmtTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

const CATEGORY_TITLES = {
  SALON: 'Orden de Montaje',
  AB: 'Orden de Alimentos & Bebidas',
  AV: 'Orden Audiovisual',
  OTROS: 'Orden de Personal de Servicio',
  EXTERNO: 'Orden de Servicios Externos',
};

const SETUP_LABELS = {
  AUDITORIO: 'Auditorio', ESCUELA: 'Escuela', U_SHAPE: 'U-Shape',
  COCTEL: 'Coctel', BANQUETE: 'Banquete',
};

function buildSetupSection(beo) {
  const s = beo.setup || {};
  return `
    <h3 style="margin:24px 0 12px;font-size:16px;color:#A17C2D;">Detalles del montaje</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px;">
      <div style="padding:12px 16px;background:#FAF7EF;border-radius:4px;border:1px solid #ECE5D5;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.12em;color:#A39B8C;font-weight:700;">Tipo de montaje</div>
        <div style="font-size:14px;color:#2A2723;font-weight:600;margin-top:4px;">${esc(SETUP_LABELS[s.type] || s.type || '—')}</div>
      </div>
      <div style="padding:12px 16px;background:#FAF7EF;border-radius:4px;border:1px solid #ECE5D5;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.12em;color:#A39B8C;font-weight:700;">Sillas</div>
        <div style="font-size:14px;color:#2A2723;font-weight:600;margin-top:4px;">${s.chairs || '—'}</div>
      </div>
      <div style="padding:12px 16px;background:#FAF7EF;border-radius:4px;border:1px solid #ECE5D5;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.12em;color:#A39B8C;font-weight:700;">Mesas</div>
        <div style="font-size:14px;color:#2A2723;font-weight:600;margin-top:4px;">${s.tables || '—'}</div>
      </div>
    </div>
    ${s.readyAt ? `<p style="font-size:13px;color:#46423B;"><strong>Montaje listo a las:</strong> ${fmtDate(s.readyAt)} — ${fmtTime(s.readyAt)}</p>` : ''}
    ${s.notes ? `<div style="margin-top:10px;padding:12px 16px;background:#FCFAF4;border-left:3px solid #A17C2D;border-radius:0 4px 4px 0;font-size:13px;color:#46423B;">${esc(s.notes)}</div>` : ''}
  `;
}

function buildMenuSection(beo) {
  const items = beo.menu || [];
  if (items.length === 0) return '<p style="color:#8A8378;font-size:13px;">Sin ítems de A&B registrados.</p>';

  const rows = items.map((m, i) => `
    <div style="display:grid;grid-template-columns:60px 1fr 60px;padding:12px 14px;align-items:center;border-bottom:1px solid #EFE9DB;${i % 2 === 1 ? 'background:#FCFAF4;' : ''}">
      <div style="font-size:13px;color:#46423B;">${esc(m.time || '—')}</div>
      <div style="font-size:13px;color:#2A2723;font-weight:500;">${esc(m.description)}${m.notes ? `<br><span style="font-size:11px;color:#8A8378;">${esc(m.notes)}</span>` : ''}</div>
      <div style="font-size:13px;color:#46423B;text-align:center;">${m.quantity || 1}</div>
    </div>
  `).join('');

  return `
    <h3 style="margin:24px 0 12px;font-size:16px;color:#A17C2D;">Menú</h3>
    <div style="border:1px solid #ECE5D5;border-radius:4px;overflow:hidden;">
      <div style="display:grid;grid-template-columns:60px 1fr 60px;padding:10px 14px;background:#2A2723;border-radius:4px 4px 0 0;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#E7DCC0;font-weight:700;">Hora</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#E7DCC0;font-weight:700;">Descripción</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#E7DCC0;font-weight:700;text-align:center;">Cant.</div>
      </div>
      ${rows}
    </div>
    ${beo.menuNotes ? `<div style="margin-top:10px;padding:12px 16px;background:#FCFAF4;border-left:3px solid #A17C2D;border-radius:0 4px 4px 0;font-size:13px;color:#46423B;"><strong>Notas del menú:</strong> ${esc(beo.menuNotes)}</div>` : ''}
  `;
}

function buildAvSection(beo) {
  const items = beo.audiovisual || [];
  if (items.length === 0) return '<p style="color:#8A8378;font-size:13px;">Sin equipos AV registrados.</p>';

  const rows = items.map((a, i) => `
    <div style="display:grid;grid-template-columns:1fr 60px;padding:12px 14px;align-items:center;border-bottom:1px solid #EFE9DB;${i % 2 === 1 ? 'background:#FCFAF4;' : ''}">
      <div style="font-size:13px;color:#2A2723;font-weight:500;">${esc(a.description)}${a.notes ? `<br><span style="font-size:11px;color:#8A8378;">${esc(a.notes)}</span>` : ''}</div>
      <div style="font-size:13px;color:#46423B;text-align:center;">${a.quantity || 1}</div>
    </div>
  `).join('');

  return `
    <h3 style="margin:24px 0 12px;font-size:16px;color:#A17C2D;">Equipos audiovisuales</h3>
    <div style="border:1px solid #ECE5D5;border-radius:4px;overflow:hidden;">
      <div style="display:grid;grid-template-columns:1fr 60px;padding:10px 14px;background:#2A2723;border-radius:4px 4px 0 0;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#E7DCC0;font-weight:700;">Descripción</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#E7DCC0;font-weight:700;text-align:center;">Cant.</div>
      </div>
      ${rows}
    </div>
    ${beo.avNotes ? `<div style="margin-top:10px;padding:12px 16px;background:#FCFAF4;border-left:3px solid #A17C2D;border-radius:0 4px 4px 0;font-size:13px;color:#46423B;"><strong>Notas:</strong> ${esc(beo.avNotes)}</div>` : ''}
  `;
}

function buildPersonnelSection(beo) {
  const items = beo.personnel || [];
  if (items.length === 0) return '<p style="color:#8A8378;font-size:13px;">Sin personal asignado.</p>';

  const rows = items.map((p, i) => `
    <div style="display:grid;grid-template-columns:1fr 60px;padding:12px 14px;align-items:center;border-bottom:1px solid #EFE9DB;${i % 2 === 1 ? 'background:#FCFAF4;' : ''}">
      <div style="font-size:13px;color:#2A2723;font-weight:500;">${esc(p.role)}</div>
      <div style="font-size:13px;color:#46423B;text-align:center;">${p.quantity || 1}</div>
    </div>
  `).join('');

  return `
    <h3 style="margin:24px 0 12px;font-size:16px;color:#A17C2D;">Personal de servicio</h3>
    <div style="border:1px solid #ECE5D5;border-radius:4px;overflow:hidden;">
      <div style="display:grid;grid-template-columns:1fr 60px;padding:10px 14px;background:#2A2723;border-radius:4px 4px 0 0;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#E7DCC0;font-weight:700;">Rol</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#E7DCC0;font-weight:700;text-align:center;">Cant.</div>
      </div>
      ${rows}
    </div>
    ${beo.personnelNotes ? `<div style="margin-top:10px;padding:12px 16px;background:#FCFAF4;border-left:3px solid #A17C2D;border-radius:0 4px 4px 0;font-size:13px;color:#46423B;"><strong>Notas:</strong> ${esc(beo.personnelNotes)}</div>` : ''}
  `;
}

function buildContentByCategory(beo) {
  switch (beo.category) {
    case 'SALON': return buildSetupSection(beo);
    case 'AB': return buildMenuSection(beo);
    case 'AV': return buildAvSection(beo);
    case 'OTROS': return buildPersonnelSection(beo);
    default: return '<p style="color:#8A8378;">Sin detalles para esta categoría.</p>';
  }
}

function buildHtml(beo) {
  const logoSrc = toBase64DataUrl(LOGO_PATH);
  const event = beo.eventId || {};
  const eventName = esc(event.name || '—');
  const companyName = esc(event.companyId?.name || '—');
  const roomName = esc(event.roomId?.name || '—');
  const eventDate = fmtDate(event.eventDate);
  const categoryTitle = CATEGORY_TITLES[beo.category] || 'Orden Operativa';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Mulish:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Mulish', sans-serif; background: #fff; }
  @page { size: A4; margin: 0; }
  .page { width: 794px; min-height: 1123px; background: #fff; display: flex; flex-direction: column; position: relative; overflow: hidden; }
  .bar { height: 6px; background: linear-gradient(90deg, #A17C2D 0%, #C8A350 50%, #A17C2D 100%); flex-shrink: 0; }
  .footer { display: flex; justify-content: space-between; align-items: center; padding: 18px 64px; border-top: 1px solid #ECE5D5; font-size: 10.5px; letter-spacing: 0.04em; color: #A39B8C; flex-shrink: 0; margin-top: auto; }
</style>
</head>
<body>
<section class="page">
  <div class="bar"></div>
  <div style="flex:1;padding:44px 64px 0 64px;display:flex;flex-direction:column;">

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      ${logoSrc ? `<img src="${logoSrc}" style="width:150px;height:auto;">` : ''}
      <div style="text-align:right;">
        <div style="font-size:10.5px;letter-spacing:0.32em;text-transform:uppercase;color:#A17C2D;font-weight:700;">Orden Operativa</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;color:#2A2723;line-height:1.05;margin-top:2px;">${esc(beo.number)}</div>
        <div style="font-size:12px;color:#8A8378;margin-top:4px;">Emitida el ${fmtDate(beo.issuedAt || beo.createdAt)}</div>
      </div>
    </div>

    <!-- Título de categoría -->
    <div style="display:flex;align-items:center;gap:16px;margin-top:28px;">
      <div style="flex:1;height:1px;background:#E4D9BD;"></div>
      <span style="font-size:11px;letter-spacing:0.34em;text-transform:uppercase;color:#A17C2D;font-weight:700;">${esc(categoryTitle)}</span>
      <div style="flex:1;height:1px;background:#E4D9BD;"></div>
    </div>

    <!-- Meta del evento -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);margin-top:24px;border:1px solid #ECE5D5;border-radius:4px;overflow:hidden;">
      <div style="padding:14px 16px;border-right:1px solid #ECE5D5;background:#FAF7EF;">
        <div style="font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#A39B8C;font-weight:700;">Evento</div>
        <div style="font-size:13px;color:#2A2723;font-weight:600;margin-top:5px;">${eventName}</div>
      </div>
      <div style="padding:14px 16px;border-right:1px solid #ECE5D5;">
        <div style="font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#A39B8C;font-weight:700;">Empresa</div>
        <div style="font-size:13px;color:#2A2723;font-weight:600;margin-top:5px;">${companyName}</div>
      </div>
      <div style="padding:14px 16px;border-right:1px solid #ECE5D5;">
        <div style="font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#A39B8C;font-weight:700;">Fecha</div>
        <div style="font-size:13px;color:#2A2723;font-weight:600;margin-top:5px;">${eventDate}</div>
      </div>
      <div style="padding:14px 16px;background:#FAF7EF;">
        <div style="font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#A39B8C;font-weight:700;">Salón</div>
        <div style="font-size:13px;color:#2A2723;font-weight:600;margin-top:5px;">${roomName}</div>
      </div>
    </div>

    <!-- Contenido por categoría -->
    ${buildContentByCategory(beo)}

    <!-- Notas generales -->
    ${beo.generalNotes ? `
    <div style="margin-top:24px;">
      <h3 style="margin:0 0 8px;font-size:14px;color:#A17C2D;">Notas generales</h3>
      <div style="padding:14px 18px;background:#FAF7EF;border:1px solid #ECE5D5;border-radius:4px;font-size:13px;color:#46423B;white-space:pre-wrap;">${esc(beo.generalNotes)}</div>
    </div>` : ''}

  </div>
  <div class="footer">
    <span>GEH Events Command Center — Hotel Windsor House</span>
    <span>eventoswindsor@gehsuites.com</span>
  </div>
</section>
</body>
</html>`;
}

let browserInstance = null;

async function getBrowser() {
  if (browserInstance && browserInstance.connected) return browserInstance;
  browserInstance = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  return browserInstance;
}

export async function generateBeoPdfBuffer(beo) {
  const html = buildHtml(beo);
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}
