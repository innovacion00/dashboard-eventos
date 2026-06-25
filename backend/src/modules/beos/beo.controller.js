import { beoService } from './beo.service.js';
import { generateBeoPdfBuffer } from './beo-pdf.service.js';
import { asyncHandler } from '../../core/utils/async-handler.js';
import { successResponse } from '../../core/utils/response.js';

export const beoController = {
  getByEvent: asyncHandler(async (req, res) => {
    const beos = await beoService.getByEventId(req.params.eventId);
    successResponse(res, (beos || []).map(mapBeo));
  }),

  create: asyncHandler(async (req, res) => {
    const beo = await beoService.createBeo(req.body, req.user, req);
    successResponse(res, mapBeo(beo), 201);
  }),

  update: asyncHandler(async (req, res) => {
    const beo = await beoService.updateBeo(req.params.id, req.body, req.user, req);
    successResponse(res, mapBeo(beo));
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const beo = await beoService.changeStatus(req.params.id, req.body.status, req.user, req);
    successResponse(res, mapBeo(beo));
  }),

  addPayment: asyncHandler(async (req, res) => {
    const filePath = req.file ? `/uploads/beo-payments/${req.file.filename}` : undefined;
    const paymentData = {
      amount: Number(req.body.amount),
      method: req.body.method || 'TRANSFERENCIA',
      reference: req.body.reference || '',
      date: req.body.date || new Date().toISOString(),
      notes: req.body.notes || '',
      file: filePath,
      createdBy: req.user.id,
    };
    const beo = await beoService.addPayment(req.params.id, paymentData, req.user, req);
    successResponse(res, mapBeo(beo));
  }),

  removePayment: asyncHandler(async (req, res) => {
    const beo = await beoService.removePayment(req.params.id, req.params.paymentId, req.user, req);
    successResponse(res, mapBeo(beo));
  }),

  downloadPdf: asyncHandler(async (req, res) => {
    const beo = await beoService.getById(req.params.id);
    const pdfBuffer = await generateBeoPdfBuffer(beo);
    const filename = `${beo.number || 'BEO'}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }),
};

function mapBeo(b) {
  return {
    id: b._id,
    number: b.number,
    eventId: b.eventId,
    category: b.category,
    setup: b.setup,
    menu: b.menu,
    menuNotes: b.menuNotes,
    audiovisual: b.audiovisual,
    avNotes: b.avNotes,
    personnel: b.personnel,
    personnelNotes: b.personnelNotes,
    suppliers: b.suppliers,
    generalNotes: b.generalNotes,
    paymentEvidence: (b.paymentEvidence || []).map(p => ({
      id: p._id,
      amount: p.amount,
      method: p.method,
      reference: p.reference,
      date: p.date,
      file: p.file,
      notes: p.notes,
      createdBy: p.createdBy,
    })),
    status: b.status,
    issuedAt: b.issuedAt,
    createdBy: b.createdBy,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}
