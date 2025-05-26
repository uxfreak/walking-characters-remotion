export const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const randomRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};