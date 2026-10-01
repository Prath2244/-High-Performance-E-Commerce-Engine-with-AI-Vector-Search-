import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscount extends Document {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  userIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    applicableCategories: [{ type: String }],
    applicableProducts: [{ type: String }],
    userIds: [{ type: String }]
  },
  { timestamps: true }
);

// Indexes
DiscountSchema.index({ code: 1 }, { unique: true });
DiscountSchema.index({ active: 1, endDate: 1 });
DiscountSchema.index({ startDate: 1, endDate: 1 });

export const Discount = mongoose.model<IDiscount>('Discount', DiscountSchema);