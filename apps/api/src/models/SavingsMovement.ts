import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const SAVINGS_TYPES = ['deposit', 'withdraw'] as const;
export type SavingsType = (typeof SAVINGS_TYPES)[number];

const savingsMovementSchema = new Schema(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: SAVINGS_TYPES, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    note: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

export type SavingsMovementDocument = InferSchemaType<typeof savingsMovementSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};
export const SavingsMovement = mongoose.model('SavingsMovement', savingsMovementSchema);
