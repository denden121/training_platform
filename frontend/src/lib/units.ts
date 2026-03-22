const KG_TO_LBS = 2.20462;
const CM_TO_IN = 0.393701;

export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / KG_TO_LBS) * 10) / 10;
}

export function cmToFtIn(cm: number): { ft: number; in: number } {
  const totalIn = cm * CM_TO_IN;
  return { ft: Math.floor(totalIn / 12), in: Math.round(totalIn % 12) };
}

export function ftInToCm(ft: string | number, inch: string | number): number {
  return Math.round((Number(ft) * 12 + Number(inch)) / CM_TO_IN);
}
