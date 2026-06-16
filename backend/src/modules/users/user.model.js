import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { ROLES } from '../../core/constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: Object.values(ROLES),
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'],
      default: 'ACTIVO',
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true, collection: 'users' }
);

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (plainPassword) {
  return bcrypt.hash(plainPassword, env.BCRYPT_ROUNDS);
};

export const User = mongoose.model('User', userSchema);
