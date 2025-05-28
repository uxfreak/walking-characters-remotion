import * as THREE from 'three';
import { JungleEnvironment } from './Jungle';
import { BeachEnvironment } from './Beach';
import { SnowyForestEnvironment } from './SnowyForest';
import { CherryBlossomEnvironment } from './CherryBlossom';
import { DesertEnvironment } from './Desert';

export type EnvironmentType = 'jungle' | 'beach' | 'snowyForest' | 'cherryBlossom' | 'desert';

export interface IEnvironment {
  updateByFrame(totalDistance: number): void;
  getConfig(): any;
}

export class EnvironmentFactory {
  static create(type: EnvironmentType, scene: THREE.Scene, seed: number = 12345): IEnvironment {
    switch (type) {
      case 'jungle':
        return new JungleEnvironment(scene, seed);
      case 'beach':
        return new BeachEnvironment(scene, seed);
      case 'snowyForest':
        return new SnowyForestEnvironment(scene, seed);
      case 'cherryBlossom':
        return new CherryBlossomEnvironment(scene, seed);
      case 'desert':
        return new DesertEnvironment(scene, seed);
      default:
        // Default to jungle if unknown type
        console.warn(`Unknown environment type: ${type}, defaulting to jungle`);
        return new JungleEnvironment(scene, seed);
    }
  }
  
  static getEnvironmentConfig(type: EnvironmentType): any {
    switch (type) {
      case 'beach':
        return {
          backgroundColor: 0x87CEEB,
          fogColor: 0xB0E0E6,
          fogNear: 30,
          fogFar: 100
        };
      case 'snowyForest':
        return {
          backgroundColor: 0xE0E5E5,
          fogColor: 0xF0F8FF,
          fogNear: 20,
          fogFar: 70
        };
      case 'cherryBlossom':
        return {
          backgroundColor: 0xFFE4E1,
          fogColor: 0xFFB6C1,
          fogNear: 25,
          fogFar: 80
        };
      case 'desert':
        return {
          backgroundColor: 0xFFE5B4,
          fogColor: 0xFFD700,
          fogNear: 35,
          fogFar: 90
        };
      case 'jungle':
      default:
        return {
          backgroundColor: 0x8FBC8F,
          fogColor: 0x7A9B7A,
          fogNear: 25,
          fogFar: 80
        };
    }
  }
}