import { HistoricalSale } from './historical-sale.model.js';

export const historicalSaleRepository = {
  async findAll(query) {
    const filter = { active: true };
    if (query.year) filter.year = Number(query.year);
    if (query.month) filter.month = Number(query.month);
    if (query.executiveId) filter.executiveId = query.executiveId;

    return HistoricalSale.find(filter)
      .populate('executiveId', 'name email')
      .sort({ year: -1, month: -1 })
      .lean();
  },

  async findByYearMonth(year, month) {
    return HistoricalSale.find({ year, month, active: true })
      .populate('executiveId', 'name email')
      .lean();
  },

  async summaryByYear(year) {
    return HistoricalSale.aggregate([
      { $match: { year: Number(year), active: true } },
      {
        $group: {
          _id: '$month',
          totalSales: { $sum: '$confirmedSales' },
          totalEvents: { $sum: '$confirmedEvents' },
          executives: { $push: { executiveId: '$executiveId', sales: '$confirmedSales', events: '$confirmedEvents' } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  async create(data) {
    const sale = new HistoricalSale(data);
    return sale.save();
  },

  async update(id, data) {
    return HistoricalSale.findByIdAndUpdate(id, { $set: data }, { new: true });
  },

  async softDelete(id) {
    return HistoricalSale.findByIdAndUpdate(id, { $set: { active: false } }, { new: true });
  },
};
