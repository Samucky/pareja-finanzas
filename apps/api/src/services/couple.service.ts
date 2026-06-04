import crypto from 'crypto';
import { Couple } from '../models/Couple.js';
import { User } from '../models/User.js';
import { encryptAmount } from '../utils/encryption.js';

const INVITE_TTL_MS = 24 * 60 * 60 * 1000;

export function generateInviteCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

export async function createCouple(name: string, ownerUserId: string) {
  const inviteCode = generateInviteCode();
  const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS);
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

export async function regenerateInviteCode(coupleId: string, userId: string) {
  const couple = await Couple.findById(coupleId);
  if (!couple) throw new Error('COUPLE_NOT_FOUND');
  if (!couple.members.some((m) => m.toString() === userId)) throw new Error('NOT_MEMBER');

  couple.inviteCode = generateInviteCode();
  couple.inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS);
  await couple.save();
  return couple;
}

export async function getCoupleInvite(coupleId: string, userId: string) {
  const couple = await Couple.findById(coupleId);
  if (!couple) throw new Error('COUPLE_NOT_FOUND');
  if (!couple.members.some((m) => m.toString() === userId)) throw new Error('NOT_MEMBER');
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
