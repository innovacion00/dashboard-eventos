import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGO_PATH = path.join(__dirname, '../../assets/logo-windsor.png');
const UPLOADS_DIR = path.join(__dirname, '../../../uploads');

function toBase64DataUrl(filePath, mime = 'image/png') {
  try {
    const buf = fs.readFileSync(filePath);
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return '';
  }
}

function resolvePhotoSrc(photo) {
  if (!photo) return '';
  const clean = photo.replace(/^\//, '');
  const abs = path.join(UPLOADS_DIR, '..', clean);
  if (fs.existsSync(abs)) {
    const ext = path.extname(abs).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    return toBase64DataUrl(abs, mime);
  }
  return photo;
}

function formatCurrency(value) {
  if (value == null) return '$ 0';
  return '$ ' + Math.round(value).toLocaleString('es-CO');
}

function fmtDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const CATEGORY_LABELS = { SALON: 'Salón', AB: 'A&B', AV: 'AV', OTROS: 'Otros', EXTERNO: 'Externo' };

const TERMS = [
  {
    title: 'Reserva del evento',
    body: 'La cotización no implica reserva del salón, únicamente una pre-reserva que bloqueará la fecha para hacerle seguimiento hasta su confirmación formal. En caso de ser considerados su mejor opción, solicitamos enviar al correo <strong style="color:#2A2723;">eventos1@gehsuites.com</strong> la confirmación con los comentarios necesarios, mínimo con doce (12) días de anticipación.',
  },
  {
    title: 'Forma de pago y garantía',
    body: 'Una vez enviada la solicitud formal de confirmación, para dar inicio a los preparativos se debe haber pagado el 100% del valor del evento, mínimo 72 horas antes, y enviado el soporte de pago a <strong style="color:#2A2723;">eventos1@gehsuites.com</strong>. Pueden realizar abonos del 25% hasta completar el 100% si confirman la fecha con al menos tres (3) meses de anticipación.',
  },
  {
    title: 'Política de cancelación',
    body: 'La cancelación debe informarse por escrito a <strong style="color:#2A2723;">eventos1@gehsuites.com</strong>: eventos corporativos con 5 días hábiles de anticipación y sociales con 8 días hábiles. De no ser así, se cobrará una penalización del 60% del valor pagado si no incluye alimentos; si los incluye y la inversión ya se ejecutó, se cobrará el 100% por alimentos, bebidas y decoración ejecutados, de los cuales podrán hacer uso.',
  },
  {
    title: 'Montaje y proveedores',
    body: 'Todo ingreso de material, elementos de montaje, pendones y equipos audiovisuales debe hacerse por la entrada al parqueadero del hotel, con el documento de relación de personal y material. El hotel no se hace responsable de ningún material o equipo; éstos deben ser retirados por el responsable una vez finalizado el evento.',
  },
  {
    title: 'Modificaciones',
    body: 'Cualquier cambio en los alimentos debe solicitarse por escrito máximo 72 horas antes del evento para actualizar la cotización y el pago. La cantidad de personas cotizadas será la que se permita ingresar el día del evento, por orden de llegada; contamos con capacidad de reacción del 10%. Cambios de montaje deben informarse antes de 72 horas; modificaciones totales de último momento tendrán costo adicional.',
  },
  {
    title: 'Logística',
    body: 'Si con motivo de la realización del evento el contratante, sus representantes o invitados ocasionan daños a las instalaciones del hotel o a equipos de alquiler, el contratante asumirá los gastos de reparación correspondientes.',
  },
];

function buildHtml(quote) {
  const companyName = esc(quote.companyId?.name || quote.company?.name || '—');
  const quoteNumber = esc(quote.number || '');
  const validUntil = fmtDate(quote.validUntil);
  const quoteDate = fmtDate(quote.createdAt || new Date());
  const eventDate = fmtDate(quote.eventDate);
  const eventType = esc(quote.eventType || '—');
  const roomName = esc(quote.roomId?.name || quote.room?.name || '—');
  const attendees = esc(String(quote.attendees || '—'));
  const logoSrc = toBase64DataUrl(LOGO_PATH);

  const roomPhotos = (quote.roomId?.photos || quote.room?.photos || []).slice(0, 2);
  const photoSrcs = roomPhotos.map(p => resolvePhotoSrc(p)).filter(Boolean);

  const items = quote.items || [];
  const icoBase = items.filter(i => i.category === 'AB').reduce((s, i) => s + (i.total || 0), 0);
  const ivaBase = (quote.subtotal || 0) - icoBase;
  const ivaAmount = quote.ivaAmount > 0 ? quote.ivaAmount : Math.round(ivaBase * (quote.taxRate || 0.19));
  const icoAmount = quote.icoAmount > 0 ? quote.icoAmount : Math.round(icoBase * 0.08);
  const taxPct = Math.round((quote.taxRate || 0.19) * 100);

  const itemRows = items.map((item, idx) => {
    const cat = CATEGORY_LABELS[item.category] || item.category || '';
    const isOther = item.category === 'OTROS';
    const pillBg = isOther ? '#F0EEE8' : '#F7F0DF';
    const pillColor = isOther ? '#7A746B' : '#A17C2D';
    const rowBg = idx % 2 === 1 ? 'background:#FCFAF4;' : '';

    return `<div style="display:grid; grid-template-columns:1fr 96px 56px 120px 140px; padding:15px 14px; align-items:center; border-bottom:1px solid #EFE9DB; ${rowBg}">
      <div style="font-size:13px; color:#2A2723; font-weight:500; padding-right:12px;">${esc(item.description)}</div>
      <div><span style="display:inline-block; font-size:10.5px; font-weight:700; color:${pillColor}; background:${pillBg}; border-radius:20px; padding:3px 11px;">${esc(cat)}</span></div>
      <div style="font-size:13px; color:#46423B; text-align:center;">${item.quantity || 0}</div>
      <div style="font-size:13px; color:#46423B; text-align:right; font-variant-numeric:tabular-nums;">${formatCurrency(item.unitPrice)}</div>
      <div style="font-size:13px; color:#2A2723; font-weight:700; text-align:right; font-variant-numeric:tabular-nums;">${formatCurrency(item.total)}</div>
    </div>`;
  }).join('');

  const photosHtml = photoSrcs.length > 0
    ? `<div style="display:grid; grid-template-columns:${photoSrcs.length === 1 ? '1fr' : '1fr 1fr'}; gap:18px; margin-top:36px;">
        ${photoSrcs.map(src => `<img src="${src}" style="width:100%; height:200px; object-fit:cover; border-radius:3px;">`).join('')}
       </div>`
    : '';

  const termsHtml = TERMS.map(t => `
    <div style="break-inside:avoid; margin-bottom:18px;">
      <div style="font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#A17C2D; font-weight:800; margin-bottom:6px;">${esc(t.title)}</div>
      <p style="margin:0; font-size:11px; line-height:1.62; color:#46423B; text-align:justify;">${t.body}</p>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Mulish:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Mulish', sans-serif; -webkit-font-smoothing: antialiased; background: #fff; }
  @page { size: A4; margin: 0; }
  .page { width: 794px; height: 1123px; background: #fff; display: flex; flex-direction: column; position: relative; overflow: hidden; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .bar { height: 6px; background: linear-gradient(90deg, #A17C2D 0%, #C8A350 50%, #A17C2D 100%); flex-shrink: 0; }
  .footer { display: flex; justify-content: space-between; align-items: center; padding: 18px 64px; border-top: 1px solid #ECE5D5; font-size: 10.5px; letter-spacing: 0.04em; color: #A39B8C; flex-shrink: 0; }
</style>
</head>
<body>

<!-- PAGE 1 — CARTA -->
<section class="page">
  <div class="bar"></div>
  <div style="flex:1; padding:56px 64px 0 64px; display:flex; flex-direction:column;">
    <div style="display:flex; justify-content:center;">
      ${logoSrc ? `<img src="${logoSrc}" style="width:206px; height:auto;">` : ''}
    </div>

    <div style="display:flex; align-items:center; gap:16px; margin-top:44px;">
      <div style="flex:1; height:1px; background:#E4D9BD;"></div>
      <span style="font-size:11px; letter-spacing:0.34em; text-transform:uppercase; color:#A17C2D; font-weight:700;">Cotización de Evento</span>
      <div style="flex:1; height:1px; background:#E4D9BD;"></div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:30px;">
      <h1 style="margin:0; font-family:'Cormorant Garamond',serif; font-weight:600; font-size:38px; color:#2A2723; line-height:1.1;">Señores: <span style="color:#A17C2D;">${companyName}</span></h1>
      <span style="font-size:12px; color:#8A8378; white-space:nowrap; padding-left:20px;">Bogotá D.C. · ${quoteDate}</span>
    </div>

    <div style="margin-top:26px; display:flex; flex-direction:column; gap:18px; font-size:14.5px; line-height:1.75; color:#46423B; max-width:62ch;">
      <p style="margin:0;">Reciba un afectuoso saludo y nuestro más sincero agradecimiento por su interés en el <strong style="color:#2A2723; font-weight:700;">Hotel Windsor House</strong> como un lugar apropiado para su evento. Queremos darle la bienvenida a nuestro hotel con las puertas abiertas, donde será para nosotros un honor ofrecerle un exclusivo y excelente servicio con un personal profesional y altamente calificado.</p>
      <p style="margin:0;">Nos encontramos en la <strong style="color:#2A2723; font-weight:600;">Cl. 95 #9-97, Chapinero, Bogotá, Colombia</strong>. Con una excelente ubicación en el norte de la ciudad, a solo diez minutos del Parque de la 93, muy cerca de la Zona T y de entidades financieras, centros de negocios, zonas de entretenimiento y casinos.</p>
    </div>

    ${photosHtml}

    <div style="margin-top:auto; padding-top:32px;">
      <div style="font-family:'Cormorant Garamond',serif; font-style:italic; font-size:19px; color:#2A2723;">Esperamos darle la bienvenida muy pronto.</div>
      <div style="font-size:13px; color:#A17C2D; font-weight:600; margin-top:4px;">GEH Events Command Center · Hotel Windsor House</div>
    </div>
  </div>
  <div class="footer" style="margin-top:32px;">
    <span>GEH Events Command Center — Hotel Windsor House</span>
    <span>innovacion@gehsuites.com</span>
    <span>Página 1 de 3</span>
  </div>
</section>

<!-- PAGE 2 — DETALLE -->
<section class="page">
  <div class="bar"></div>
  <div style="flex:1; padding:44px 64px 0 64px; display:flex; flex-direction:column;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      ${logoSrc ? `<img src="${logoSrc}" style="width:150px; height:auto;">` : ''}
      <div style="text-align:right;">
        <div style="font-size:10.5px; letter-spacing:0.32em; text-transform:uppercase; color:#A17C2D; font-weight:700;">Cotización</div>
        <div style="font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:600; color:#2A2723; line-height:1.05; margin-top:2px;">${quoteNumber}</div>
        <div style="font-size:12px; color:#8A8378; margin-top:4px;">Válida hasta el ${validUntil}</div>
      </div>
    </div>

    <!-- Meta -->
    <div style="display:grid; grid-template-columns:repeat(5,1fr); margin-top:34px; border:1px solid #ECE5D5; border-radius:4px; overflow:hidden;">
      <div style="padding:14px 16px; border-right:1px solid #ECE5D5; background:#FAF7EF;">
        <div style="font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:#A39B8C; font-weight:700;">Empresa</div>
        <div style="font-size:14px; color:#2A2723; font-weight:600; margin-top:5px;">${companyName}</div>
      </div>
      <div style="padding:14px 16px; border-right:1px solid #ECE5D5;">
        <div style="font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:#A39B8C; font-weight:700;">Tipo de evento</div>
        <div style="font-size:14px; color:#2A2723; font-weight:600; margin-top:5px;">${eventType}</div>
      </div>
      <div style="padding:14px 16px; border-right:1px solid #ECE5D5;">
        <div style="font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:#A39B8C; font-weight:700;">Fecha</div>
        <div style="font-size:14px; color:#2A2723; font-weight:600; margin-top:5px;">${eventDate}</div>
      </div>
      <div style="padding:14px 16px; border-right:1px solid #ECE5D5;">
        <div style="font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:#A39B8C; font-weight:700;">Salón</div>
        <div style="font-size:14px; color:#2A2723; font-weight:600; margin-top:5px;">${roomName}</div>
      </div>
      <div style="padding:14px 16px; background:#FAF7EF;">
        <div style="font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:#A39B8C; font-weight:700;">Asistentes</div>
        <div style="font-size:14px; color:#2A2723; font-weight:600; margin-top:5px;">${attendees}</div>
      </div>
    </div>

    <h2 style="margin:38px 0 0 0; font-family:'Cormorant Garamond',serif; font-weight:600; font-size:26px; color:#2A2723;">Detalle de servicios</h2>

    <!-- Tabla -->
    <div style="margin-top:16px;">
      <div style="display:grid; grid-template-columns:1fr 96px 56px 120px 140px; padding:11px 14px; background:#2A2723; border-radius:4px 4px 0 0;">
        <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#E7DCC0; font-weight:700;">Descripción</div>
        <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#E7DCC0; font-weight:700;">Categoría</div>
        <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#E7DCC0; font-weight:700; text-align:center;">Cant.</div>
        <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#E7DCC0; font-weight:700; text-align:right;">Precio unit.</div>
        <div style="font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#E7DCC0; font-weight:700; text-align:right;">Total</div>
      </div>
      ${itemRows}
    </div>

    <!-- Totales -->
    <div style="display:flex; justify-content:flex-end; margin-top:26px;">
      <div style="width:340px;">
        <div style="display:flex; justify-content:space-between; padding:9px 4px; font-size:13px; color:#46423B; border-bottom:1px solid #EFE9DB;">
          <span>Subtotal</span><span style="font-variant-numeric:tabular-nums;">${formatCurrency(quote.subtotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:9px 4px; font-size:13px; color:#46423B; border-bottom:1px solid #EFE9DB;">
          <span>IVA (${taxPct}%)</span><span style="font-variant-numeric:tabular-nums;">${formatCurrency(ivaAmount)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:9px 4px; font-size:13px; color:#46423B; border-bottom:1px solid #EFE9DB;">
          <span>ICO — A&amp;B (8%)</span><span style="font-variant-numeric:tabular-nums;">${formatCurrency(icoAmount)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 18px; margin-top:12px; background:#2A2723; border-radius:5px;">
          <span style="font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:#E7DCC0; font-weight:700;">Total</span>
          <span style="font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:700; color:#fff; font-variant-numeric:tabular-nums;">${formatCurrency(quote.total)}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="footer" style="margin-top:32px;">
    <span>GEH Events Command Center — Hotel Windsor House</span>
    <span>innovacion@gehsuites.com</span>
    <span>Página 2 de 3</span>
  </div>
</section>

<!-- PAGE 3 — TÉRMINOS -->
<section class="page">
  <div class="bar"></div>
  <div style="flex:1; padding:44px 64px 0 64px; display:flex; flex-direction:column;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      ${logoSrc ? `<img src="${logoSrc}" style="width:150px; height:auto;">` : ''}
      <div style="text-align:right;">
        <div style="font-size:10.5px; letter-spacing:0.32em; text-transform:uppercase; color:#A17C2D; font-weight:700;">Cotización · ${quoteNumber}</div>
        <div style="font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:600; color:#2A2723; line-height:1.1; margin-top:2px;">Términos y condiciones</div>
      </div>
    </div>

    <div style="columns:2; column-gap:34px; margin-top:30px;">
      ${termsHtml}
    </div>

    <div style="margin-top:14px; padding:22px 26px; background:#FAF7EF; border:1px solid #ECE5D5; border-radius:5px;">
      <p style="margin:0; font-family:'Cormorant Garamond',serif; font-size:16px; line-height:1.7; color:#46423B; text-align:center; font-style:italic;">Esperamos servirle con el mayor profesionalismo y buen servicio que nos caracteriza, para que su actividad se desarrolle a la perfección. El Hotel Windsor House lo invita a conocer nuestras instalaciones; estamos para servirle las 24 horas del día. ¡Muchas gracias!</p>
    </div>
  </div>
  <div class="footer" style="margin-top:28px;">
    <span>GEH Events Command Center — Hotel Windsor House</span>
    <span>innovacion@gehsuites.com</span>
    <span>Página 3 de 3</span>
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

export async function generateQuotePdfBuffer(quote) {
  const html = buildHtml(quote);
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
