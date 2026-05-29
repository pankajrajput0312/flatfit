import { Member } from '@/types';
import {
  WATER_GLASS_COUNT,
  formatGrams,
  formatLiters,
} from '@/lib/points';

export {
  WATER_GLASS_COUNT,
  MAX_GYM_POINTS,
  MAX_PROTEIN_POINTS,
  MAX_WATER_POINTS,
  MAX_DAILY_POINTS,
} from '@/lib/points';

export function getWaterPerGlass(waterTargetL: number): number {
  return waterTargetL / WATER_GLASS_COUNT;
}

export function getLitersFromDroplets(droplets: number, waterTargetL: number): number {
  return (droplets / WATER_GLASS_COUNT) * waterTargetL;
}

export function getWaterProgress(droplets: number, waterTargetL: number): number {
  if (waterTargetL <= 0) return 0;
  return Math.min((getLitersFromDroplets(droplets, waterTargetL) / waterTargetL) * 100, 100);
}

export function getProteinProgress(proteinG: number, proteinTargetG: number): number {
  if (proteinTargetG <= 0) return 0;
  return Math.min((proteinG / proteinTargetG) * 100, 100);
}

export interface MemberGoalSnapshot {
  waterTargetL: number;
  proteinTargetG: number;
  waterPerGlassL: number;
  waterLiters: number;
  waterDroplets: number;
  proteinG: number;
  waterProgress: number;
  proteinProgress: number;
}

export function getMemberGoalSnapshot(
  member: Member,
  droplets: number,
  proteinG: number
): MemberGoalSnapshot {
  const waterTargetL = member.water_target_l;
  const proteinTargetG = member.protein_target_g;

  return {
    waterTargetL,
    proteinTargetG,
    waterPerGlassL: getWaterPerGlass(waterTargetL),
    waterLiters: getLitersFromDroplets(droplets, waterTargetL),
    waterDroplets: droplets,
    proteinG,
    waterProgress: getWaterProgress(droplets, waterTargetL),
    proteinProgress: getProteinProgress(proteinG, proteinTargetG),
  };
}

export function formatWaterGlassHint(waterTargetL: number): string {
  return `${WATER_GLASS_COUNT} glasses · ${formatLiters(getWaterPerGlass(waterTargetL))} each`;
}

export function formatWaterProgress(droplets: number, waterTargetL: number): string {
  return `${formatLiters(getLitersFromDroplets(droplets, waterTargetL))} / ${formatLiters(waterTargetL)}`;
}

export function formatProteinProgress(proteinG: number, proteinTargetG: number): string {
  return `${formatGrams(proteinG)} / ${formatGrams(proteinTargetG)}`;
}
