import * as THREE from 'three';

export interface LoopableObject extends THREE.Object3D {
  userData: {
    isBackgroundObject?: boolean;
    resetZ?: number;
    maxZ?: number;
    speed?: number;
    [key: string]: any;
  };
}

export const createLoopableObject = (
  object: THREE.Object3D,
  resetZ: number,
  maxZ: number,
  speed?: number
): LoopableObject => {
  const loopable = object as LoopableObject;
  loopable.userData.isBackgroundObject = true;
  loopable.userData.resetZ = resetZ;
  loopable.userData.maxZ = maxZ;
  if (speed !== undefined) {
    loopable.userData.speed = speed;
  }
  return loopable;
};

export const updateLoopPosition = (
  object: LoopableObject,
  deltaZ: number
): void => {
  const speed = object.userData.speed || 1;
  object.position.z -= deltaZ * speed;
  
  if (object.position.z < object.userData.resetZ!) {
    object.position.z = object.userData.maxZ!;
  }
};