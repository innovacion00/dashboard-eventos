import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './format.js';

const CATEGORY_LABELS = { SALON: 'Salón', AB: 'A&B', AV: 'AV', OTROS: 'Otros', EXTERNO: 'Externo' };

const GOLD  = [161, 130, 73];
const BLACK = [30, 30, 30];
const GRAY  = [120, 120, 120];
const LIGHT = [248, 246, 241];

function formatDateShort(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

const GREETING_PARA1 =
  'Reciba un afectuoso saludo y nuestro más sincero agradecimiento por su interés en el ';
const GREETING_HOTEL_NAME = 'HOTEL WINDSOR HOUSE';
const GREETING_PARA1_END =
  ' como un lugar apropiado para su evento. Queremos darle la bienvenida a nuestro hotel con las puertas abiertas ' +
  'donde será para nosotros un honor ofrecerle un exclusivo y excelente servicio con un personal profesional y ' +
  'altamente calificado.';
const GREETING_PARA2 =
  'Nos encontramos en la Cl. 95 #9-97, Chapinero, Bogotá, Colombia. Con una excelente ' +
  'ubicación en el norte de la Ciudad, a solo diez minutos del parque de la 93, muy cerca de la zona T y entidades ' +
  'financieras, centros de negocios, zonas de entretenimiento y casinos.';

const TERMS_SECTIONS = [
  {
    title: 'RESERVA EVENTO',
    body: 'La cotización no implica reserva del salón únicamente una pre reserva que bloqueara la fecha para poder hacerle un seguimiento hasta su confirmación formal, por este motivo, en caso de ser considerados como su mejor opción, solicitamos nos envíe vía electrónica al correo eventos1@gehsuites.com confirmación con los comentarios necesarios para que su actividad se lleve a cabo perfectamente mínimo con ocho (12) días de anticipación debe confirmarnos.',
  },
  {
    title: 'FORMA DE PAGO Y GARANTÍA',
    body: 'Una vez enviada la solicitud formal de la confirmación, para dar inicio con los preparativos del evento se debe haber hecho pago del 100% del valor del evento como mínimo con 72 horas de anticipación y haber enviado el soporte de pago al correo eventos1@gehsuites.com pueden realizar abonos de 25% hasta completar el 100% si ha confirmado su fecha por lo menos con tres (3) meses de anticipación.',
  },
  {
    title: 'POLÍTICA DE CANCELACIÓN',
    body: 'La cancelación del evento debe informarse por escrito al correo eventos1@gehsuites.com (Para eventos corporativos: informar con 5 días hábiles de anticipación, para eventos sociales con 8 días hábiles de anticipación, de no ser así, se dará lugar al cobro de penalización equivalente al 60% del valor pagado del evento si no incluye alimentos, pero si los incluye y esta inversión ya se ha hecho efectiva por parte del hotel se cobrará el 100% del valor por alimentos, bebidas y decoración que ya se haya ejecutado y del cual podrán hacer uso).',
  },
  {
    title: 'MONTAJE Y PROVEEDORES',
    body: 'Todo el ingreso de material, elementos de montaje, pendones y equipos audiovisuales de su evento, debe hacerse por la entrada al parqueadero del hotel con el documento de relación de personal y material que será ingresado. El hotel no se hace responsable de ningún material o equipos, éstos deben ser retirados por el responsable luego de finalizado el evento.',
  },
  {
    title: 'MODIFICACIONES',
    body: 'Cualquier cambio o solicitud en cuanto a los alimentos escogidos debe realizarse por escrito máximo 72 horas antes del evento, para de esta manera generar la actualización de la cotización y el pago correspondiente, la cantidad de personas cotizadas será la cantidad de personas que se dejarán ingresar el día del evento en el orden de llegada, contamos con capacidad de reacción de 10%; los cambios en el montaje deben ser informados antes de 72 horas, y cambios repentinos que generen la modificación del montaje en su totalidad al que inicialmente se escogió tendrá un costo adicional. (si después de las 48 horas o durante el evento no llega alguna persona el cliente podrá disponer y llevar los alimentos contratados, se entiende que una vez contratados no podrán cancelarse fuera del tiempo establecido, si el cliente deja comida olvidada en el hotel de esta empacada la misma no se asegurará en ningunos de nuestros almacenamientos por prevención)',
  },
  {
    title: 'LOGÍSTICA',
    body: 'Si con motivo de la realización del evento el contratante o sus representantes e invitados ocasionan daños a las instalaciones del hotel o equipos de alquiler, el contratante asumirá los gastos de reparación correspondientes.',
  },
];

const TERMS_CLOSING =
  'Esperamos poder servirle con el mayor profesionalismo y buen servicio que nos caracteriza para que de esta manera tenga usted un excelente evento y su actividad se desarrolle a la perfección, en el Hotel Windsor House lo invita a conocer nuestras instalaciones y de igual forma estamos para servirle las 24 horas del día. Estamos siempre atentos y disponibles para resolver cualquier inquietud, consulta o requerimiento adicional que se pueda presentar ¡Muchas gracias!';

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function imgToDataUrl(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.85);
}

function drawHeader(doc, quote) {
  const W = doc.internal.pageSize.getWidth();

  doc.setFillColor(...GOLD);
  doc.rect(0, 0, W, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GEH Events Command Center', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Hotel Windsor House', 14, 17);
  doc.text('innovacion@gehsuites.com', 14, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('COTIZACIÓN', W - 14, 11, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.number || '', W - 14, 17, { align: 'right' });
  doc.text(`Válida hasta: ${formatDate(quote.validUntil)}`, W - 14, 22, { align: 'right' });
}

function drawFooter(doc) {
  const W = doc.internal.pageSize.getWidth();
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(10, 284, W - 10, 284);
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text('GEH Events Command Center — Hotel Windsor House', 14, 289);
    doc.text(`Página ${i} de ${pageCount}`, W - 14, 289, { align: 'right' });
  }
}

export async function generateQuotePdf(quote) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const companyName = quote.company?.name || '—';

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 1 — Carta de presentación (estilo carta formal con logos)
  // ═══════════════════════════════════════════════════════════════════════════
  let y = 14;

  // ── Logo Windsor House ──────────────────────────────────────────────────────
  const logoWH = await loadImage('/quote._logoWH.jpg');

  if (logoWH) {
    const lw = 45, lh = 25;
    doc.addImage(imgToDataUrl(logoWH), 'JPEG', 14, y, lw, lh);
  }

  y += 34;

  // ── Fecha ───────────────────────────────────────────────────────────────────
  const quoteDate = formatDateShort(quote.createdAt || new Date());
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bogotá DC ${quoteDate}`, 14, y);
  y += 18;

  // ── Destinatario ────────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.text(`Señores: ${companyName}`, 14, y);
  y += 18;

  // ── Cuerpo del saludo (con HOTEL WINDSOR HOUSE en negrita) ─────────────────
  const bodyMarginL = 30;
  const bodyW = W - bodyMarginL - 20;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);

  const fullPara1 = GREETING_PARA1 + GREETING_HOTEL_NAME + GREETING_PARA1_END;
  const para1Lines = doc.splitTextToSize(fullPara1, bodyW);

  for (let i = 0; i < para1Lines.length; i++) {
    const line = para1Lines[i];
    const lineY = y + i * 5.5;
    const boldIdx = line.indexOf(GREETING_HOTEL_NAME);
    if (boldIdx >= 0) {
      const before = line.substring(0, boldIdx);
      const after = line.substring(boldIdx + GREETING_HOTEL_NAME.length);
      let cx = bodyMarginL;
      if (before) {
        doc.setFont('helvetica', 'normal');
        doc.text(before, cx, lineY);
        cx += doc.getTextWidth(before);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(GREETING_HOTEL_NAME, cx, lineY);
      cx += doc.getTextWidth(GREETING_HOTEL_NAME);
      if (after) {
        doc.setFont('helvetica', 'normal');
        doc.text(after, cx, lineY);
      }
    } else {
      doc.setFont('helvetica', 'normal');
      doc.text(line, bodyMarginL, lineY);
    }
  }

  y += para1Lines.length * 5.5 + 8;

  const para2Lines = doc.splitTextToSize(GREETING_PARA2, bodyW);
  doc.setFont('helvetica', 'normal');
  doc.text(para2Lines, bodyMarginL, y);
  y += para2Lines.length * 5.5 + 14;

  // ── Fotos del salón (3 columnas) ────────────────────────────────────────────
  const roomPhotos = quote.room?.photos || [];
  const images = roomPhotos.length > 0
    ? (await Promise.all(roomPhotos.map(loadImage))).filter(Boolean)
    : [];

  if (images.length > 0) {
    const cols = Math.min(images.length, 3);
    const gap = 5;
    const totalGap = (cols - 1) * gap;
    const photoW = (W - 28 - totalGap) / cols;
    const photoH = photoW * 0.7;

    for (let i = 0; i < images.length; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 14 + col * (photoW + gap);
      const py = y + row * (photoH + gap);

      if (py + photoH > H - 20) {
        doc.addPage();
        y = 20;
      }

      doc.addImage(imgToDataUrl(images[i]), 'JPEG', x, py, photoW, photoH);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 2 — Cotización detallada
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader(doc, quote);
  y = 36;

  // ── Datos del cliente / evento ───────────────────────────────────────────────
  doc.setFillColor(...LIGHT);
  doc.rect(10, y, W - 20, 36, 'F');

  const col1 = 14;
  const col2 = W / 2 + 4;

  const infoRow = (label, value, cx, cy) => {
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(label.toUpperCase(), cx, cy);
    doc.setFontSize(9.5);
    doc.setTextColor(...BLACK);
    doc.setFont('helvetica', 'bold');
    doc.text(value || '—', cx, cy + 5);
  };

  infoRow('Empresa',         companyName,                   col1, y + 7);
  infoRow('Tipo de evento',  quote.eventType    || '—',     col2, y + 7);
  infoRow('Fecha del evento', formatDate(quote.eventDate),  col1, y + 21);
  infoRow('Salón',           quote.room?.name   || '—',     col2, y + 21);

  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text('ASISTENTES', col2 + 50, y + 21);
  doc.setFontSize(9.5);
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.text(String(quote.attendees || '—'), col2 + 50, y + 26);

  y += 44;

  // ── Tabla de ítems ───────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de servicios', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: 10, right: 10 },
    head: [['Descripción', 'Categoría', 'Cant.', 'Precio unit.', 'Total']],
    body: (quote.items || []).map(item => [
      item.description,
      CATEGORY_LABELS[item.category] || item.category,
      item.quantity,
      formatCurrency(item.unitPrice),
      formatCurrency(item.total),
    ]),
    foot: (() => {
      const icoBase   = (quote.items || []).filter(i => i.category === 'AB').reduce((s, i) => s + (i.total || 0), 0);
      const ivaBase   = (quote.subtotal || 0) - icoBase;
      const ivaAmount = quote.ivaAmount > 0 ? quote.ivaAmount : Math.round(ivaBase * (quote.taxRate || 0.19) * 100) / 100;
      const icoAmount = quote.icoAmount > 0 ? quote.icoAmount : Math.round(icoBase * 0.08 * 100) / 100;
      return [
        [{ content: 'Subtotal', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, formatCurrency(quote.subtotal)],
        [{ content: `IVA (${Math.round((quote.taxRate || 0.19) * 100)}%)`, colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, formatCurrency(ivaAmount)],
        [{ content: 'ICO — A&B (8%)', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, formatCurrency(icoAmount)],
        [{ content: 'TOTAL', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fontSize: 11, textColor: GOLD } }, { content: formatCurrency(quote.total), styles: { fontStyle: 'bold', fontSize: 11, textColor: GOLD } }],
      ];
    })(),
    headStyles:  { fillColor: GOLD, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    footStyles:  { fillColor: LIGHT, textColor: BLACK, fontSize: 9 },
    bodyStyles:  { textColor: BLACK, fontSize: 9 },
    alternateRowStyles: { fillColor: [252, 251, 248] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      2: { halign: 'right', cellWidth: 18 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 },
    },
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Notas ────────────────────────────────────────────────────────────────────
  if (quote.notes) {
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    doc.text('Notas para el cliente', 14, y);
    y += 5;
    doc.setTextColor(...BLACK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(quote.notes, W - 28);
    doc.text(lines, 14, y);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 3+ — Términos y condiciones
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader(doc, quote);
  y = 36;

  const termsW = W - 28;

  for (const section of TERMS_SECTIONS) {
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');

    const titleLines = doc.splitTextToSize(section.title, termsW);
    const bodyLines = doc.splitTextToSize(section.body, termsW);
    const blockH = titleLines.length * 4.5 + bodyLines.length * 4 + 8;

    if (y + blockH > H - 20) {
      doc.addPage();
      drawHeader(doc, quote);
      y = 36;
    }

    doc.text(titleLines, 14, y);
    y += titleLines.length * 4.5 + 2;

    doc.setFontSize(8.5);
    doc.setTextColor(...BLACK);
    doc.setFont('helvetica', 'normal');
    doc.text(bodyLines, 14, y);
    y += bodyLines.length * 4 + 8;
  }

  // ── Cierre ──────────────────────────────────────────────────────────────────
  const closingLines = doc.splitTextToSize(TERMS_CLOSING, termsW);
  const closingH = closingLines.length * 4.5 + 6;

  if (y + closingH > H - 20) {
    doc.addPage();
    drawHeader(doc, quote);
    y = 36;
  }

  doc.setFontSize(9);
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'italic');
  doc.text(closingLines, 14, y);

  // ── Pie de página en todas las páginas ──────────────────────────────────────
  drawFooter(doc);

  doc.save(`${quote.number || 'cotizacion'}.pdf`);
}
