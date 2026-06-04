import crypto from 'crypto';
import { Couple } from '../models/Couple.js';
import { User } from '../models/User.js';
import { encryptAmount } from '../utils/encryption.js';

export function generateInviteCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

export async function createCouple(name: string, ownerUserId: string) {
  const inviteCode = generateInviteCode();
  const inviteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const couple = await Couple.create({
    name,
    inviteCode,
    inviteExpiresAt,
    members: [ownerUserId],
    liquidBalanceEncrypted: encryptAmount(0),
    savingsBalanceEncrypted: encryptAmount(0),
  });
  await User.findByIdAndUpdate(ownerUserId, { coupleId: couple._id });
  return couple;
}

export async function joinCoupleByCode(userId: string, code: string) {
  const couple = await Couple.findOne({ inviteCode: code.toUpperCase() });
  if (!couple) throw new Error('INVALID_CODE');
  if (couple.inviteExpiresAt < new Date()) throw new Error('CODE_EXPIRED');
  if (couple.members.length >= 2) throw new Error('COUPLE_FULL');
  if (couple.members.some((m) => m.toString() === userId)) throw new Error('ALREADY_MEMBER');

  couple.members.push(userId as unknown as import('mongoose').Types.ObjectId);
  await couple.save();
  await User.findByIdAndUpdate(userId, { coupleId: couple._id });
  return couple;
}
