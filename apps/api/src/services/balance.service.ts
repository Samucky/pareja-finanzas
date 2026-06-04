import { Couple, type CoupleDocument } from '../models/Couple.js';
import { decryptAmount, encryptAmount } from '../utils/encryption.js';

export interface CoupleBalances {
  liquid: number;
  savings: number;
  available: number;
}

export function readBalances(couple: CoupleDocument): CoupleBalances {
  const liquid = decryptAmount(couple.liquidBalanceEncrypted);
  const savings = decryptAmount(couple.savingsBalanceEncrypted);
  return { liquid, savings, available: liquid };
}

export async function updateBalances(
  coupleId: string,
  updater: (current: CoupleBalances) => CoupleBalances
): Promise<CoupleBalances> {
  const couple = await Couple.findById(coupleId);
  if (!couple) throw new Error('Couple not found');
  const next = updater(readBalances(couple));
  couple.liquidBalanceEncrypted = encryptAmount(next.liquid);
  couple.savingsBalanceEncrypted = encryptAmount(next.savings);
  await couple.save();
  return next;
}
