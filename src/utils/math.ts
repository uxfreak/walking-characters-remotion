export const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Seeded random number generator for deterministic results
export class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

export const randomRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

export const seededRandomRange = (min: number, max: number, seed: number): number => {
  const rng = new SeededRandom(seed);
  return rng.range(min, max);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};