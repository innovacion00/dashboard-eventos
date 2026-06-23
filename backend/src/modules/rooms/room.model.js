import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    aliases: [{ type: String, trim: true }],
    description: { type: String },
    capacities: {
      auditorium: { type: Number, min: 0 },
      school: { type: Number, min: 0 },
      uShape: { type: Number, min: 0 },
      cocktail: { type: Number, min: 0 },
      banquet: { type: Number, min: 0 },
    },
    baseRate: { type: Number, min: 0 },
    photos: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'rooms' }
);

export const Room = mongoose.model('Room', roomSchema);
