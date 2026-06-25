import mongoose from 'mongoose';

const historicalSaleSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    executiveId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    confirmedSales: { type: Number, required: true, min: 0 },
    confirmedEvents: { type: Number, required: true, min: 0, default: 0 },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'historical_sales' }
);

historicalSaleSchema.index({ year: 1, month: 1 });
historicalSaleSchema.index({ executiveId: 1 });
historicalSaleSchema.index({ year: 1, month: 1, executiveId: 1 }, { unique: true });

export const HistoricalSale = mongoose.model('HistoricalSale', historicalSaleSchema);
