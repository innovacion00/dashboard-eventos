import { beoRepository } from './beo.repository.js';
import { NotFoundError } from '../../core/errors/NotFoundError.js';
import { ConflictError } from '../../core/errors/ConflictError.js';
import { AppError } from '../../core/errors/AppError.js';
import { audit } from '../audit/audit.service.js';
import { generateBeoPdfBuffer } from './beo-pdf.service.js';
import { sendEmail } from '../notifications/email.service.js';
import { Vendor } from '../vendors/vendor.model.js';
import { logger } from '../../config/logger.js';

const CATEGORY_ORDER = ['SALON', 'AB', 'AV', 'OTROS', 'EXTERNO'];

export const beoService = {
  async getByEventId(eventId) {
    return beoRepository.findByEventId(eventId);
  },

  async createFromQuote(quote, event, requestingUser, req) {
    const itemsByCategory = {};
    for (const item of (quote.items || [])) {
      const cat = item.category || 'OTROS';
      if (!itemsByCategory[cat]) itemsByCategory[cat] = [];
      itemsByCategory[cat].push(item);
    }

    const created = [];
    for (const category of CATEGORY_ORDER) {
      const items = itemsByCategory[category];
      if (!items || items.length === 0) continue;

      const existing = await beoRepository.findByEventIdAndCategory(event._id, category);
      if (existing) { created.push(existing); continue; }

      const beoData = { eventId: event._id, category, createdBy: requestingUser.id };

      if (category === 'SALON') {
        beoData.setup = {
          notes: items.map(i => `${i.description} (x${i.quantity})`).join('\n'),
        };
      } else if (category === 'AB') {
        beoData.menu = items.map(i => ({
          description: i.description,
          serviceId: i.serviceId?._id || i.serviceId || undefined,
          quantity: i.quantity,
        }));
      } else if (category === 'AV') {
        beoData.audiovisual = items.map(i => ({
          description: i.description,
          serviceId: i.serviceId?._id || i.serviceId || undefined,
          quantity: i.quantity,
        }));
      } else {
        // OTROS → personal de servicio
        beoData.personnel = items.map(i => ({
          role: i.description,
          quantity: i.quantity,
        }));
      }

      const beo = await beoRepository.create(beoData);
      await audit({
        userId: requestingUser.id,
        userEmail: requestingUser.email,
        module: 'beos',
        action: 'CREATE',
        entityId: beo._id,
        after: { number: beo.number, eventId: event._id, category, source: 'auto-from-quote' },
        req,
      });
      created.push(beo);
    }

    return created;
  },

  async getById(id) {
    const beo = await beoRepository.findById(id);
    if (!beo || !beo.active) throw new NotFoundError('BEO no encontrado');
    return beo;
  },

  async createBeo(data, requestingUser, req) {
    if (data.category) {
      const existing = await beoRepository.findByEventIdAndCategory(data.eventId, data.category);
      if (existing) throw new ConflictError('Este evento ya tiene un BEO para esta categoría.');
    }

    const beo = await beoRepository.create({
      ...data,
      createdBy: requestingUser.id,
    });

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'beos',
      action: 'CREATE',
      entityId: beo._id,
      after: { number: beo.number, eventId: beo.eventId },
      req,
    });

    return beo;
  },

  async updateBeo(id, data, requestingUser, req) {
    const beo = await beoRepository.findById(id);
    if (!beo || !beo.active) throw new NotFoundError('BEO no encontrado');
    if (beo.status === 'CONFIRMADO') {
      throw new AppError('No se puede editar un BEO confirmado', 409, 'INVALID_STATE');
    }

    const updated = await beoRepository.update(id, data);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'beos',
      action: 'UPDATE',
      entityId: id,
      after: { status: updated.status },
      req,
    });

    return updated;
  },

  async changeStatus(id, newStatus, requestingUser, req) {
    const beo = await beoRepository.findById(id);
    if (!beo || !beo.active) throw new NotFoundError('BEO no encontrado');

    if (beo.status === 'CONFIRMADO') {
      throw new AppError('No se puede cambiar el estado de un BEO confirmado', 409, 'INVALID_STATE');
    }

    const before = { status: beo.status };
    const updated = await beoRepository.changeStatus(id, newStatus);

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'beos',
      action: 'UPDATE',
      entityId: id,
      before,
      after: { status: newStatus },
      req,
    });

    if (newStatus === 'EMITIDO') {
      sendBeoToVendors(id, beo.category).catch(err =>
        logger.error({ err, beoId: id }, 'Error al enviar BEO a proveedores')
      );
    }

    return updated;
  },

  async addPayment(id, paymentData, requestingUser, req) {
    const beo = await beoRepository.findById(id);
    if (!beo || !beo.active) throw new NotFoundError('BEO no encontrado');

    beo.paymentEvidence.push(paymentData);
    const updated = await beo.save();

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'beos',
      action: 'UPDATE',
      entityId: id,
      after: { payment: paymentData.amount, reference: paymentData.reference },
      req,
    });

    return beoRepository.findById(id);
  },

  async removePayment(id, paymentId, requestingUser, req) {
    const beo = await beoRepository.findById(id);
    if (!beo || !beo.active) throw new NotFoundError('BEO no encontrado');

    beo.paymentEvidence.id(paymentId)?.deleteOne();
    await beo.save();

    await audit({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      module: 'beos',
      action: 'UPDATE',
      entityId: id,
      after: { removedPaymentId: paymentId },
      req,
    });

    return beoRepository.findById(id);
  },
};

async function sendBeoToVendors(beoId, category) {
  const beo = await beoRepository.findById(beoId);
  if (!beo) return;

  const vendors = await Vendor.find({ category, active: true, email: { $exists: true, $ne: '' } }).select('name email');
  if (!vendors.length) {
    logger.info({ beoId, category }, 'No hay proveedores con email para esta categoría');
    return;
  }

  const pdfBuffer = await generateBeoPdfBuffer(beo);
  const filename = `${beo.number}.pdf`;
  const eventName = beo.eventId?.name || '';
  const CATEGORY_LABELS = { SALON: 'Montaje', AB: 'A&B', AV: 'AV', OTROS: 'Personal', EXTERNO: 'Externo' };
  const catLabel = CATEGORY_LABELS[category] || category;

  for (const vendor of vendors) {
    await sendEmail({
      to: vendor.email,
      subject: `Orden Operativa ${beo.number} — ${catLabel}`,
      title: `Orden Operativa — ${catLabel}`,
      message: `Estimado(a) ${vendor.name},<br><br>Adjunto encontrará la orden operativa <strong>${beo.number}</strong> para el evento <strong>${eventName}</strong>.<br><br>Por favor revisar los detalles y confirmar disponibilidad.`,
      attachments: [{ filename, content: pdfBuffer, contentType: 'application/pdf' }],
    });
  }

  logger.info({ beoId, category, vendorCount: vendors.length }, 'BEO enviado a proveedores');
}
