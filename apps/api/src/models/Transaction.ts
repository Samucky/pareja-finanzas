import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const TRANSACTION_TYPES = ['income', 'expense'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const EXPENSE_CATEGORIES = [
  'comida',
  'transporte',
  'hogar',
  'ocio',
  'salud',
  'otros',
] as const;

const transactionSchema = new Schema(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, enum: EXPENSE_CATEGORIES },
    note: { type: String, trim: true, maxlength: 200 },
    paidBy: { type: String, trim: true },
  },
  { timestamps: true }
);

transactionSchema.index({ coupleId: 1, createdAt: -1 });

export type TransactionDocument = InferSchemaType<typeof transactionSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};
export const Transaction = mongoose.model('Transaction', transactionSchema);
