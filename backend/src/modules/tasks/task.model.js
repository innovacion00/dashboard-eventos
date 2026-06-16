import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String },
    priority: {
      type: String,
      required: true,
      enum: ['ALTA', 'MEDIA', 'BAJA'],
      default: 'MEDIA',
    },
    dueDate: { type: Date, index: 1 },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'VENCIDA'],
      default: 'PENDIENTE',
      index: true,
    },
    relatedEntity: {
      kind: { type: String, enum: ['company', 'opportunity', 'event'] },
      id: { type: mongoose.Schema.Types.ObjectId },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt: { type: Date },
  },
  { timestamps: true, collection: 'tasks' }
);

taskSchema.index({ priority: 1 });

export const Task = mongoose.model('Task', taskSchema);
