import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const coupleSchema = new Schema(
  {
    name: { type: String, default: 'Nuestra pareja', trim: true },
    inviteCode: { type: String, required: true, unique: true, uppercase: true },
    inviteExpiresAt: { type: Date, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    liquidBalanceEncrypted: { type: String, required: true },
    savingsBalanceEncrypted: { type: String, required: true },
  },
  { timestamps: true }
);

export type CoupleDocument = InferSchemaType<typeof coupleSchema> & { _id: mongoose.Types.ObjectId };
export const Couple = mongoose.model('Couple', coupleSchema);
