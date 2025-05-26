import * as THREE from 'three';
import { EnvironmentMaterials } from '../../constants/materials';
import { randomRange } from '../../utils/math';
import { createLoopableObject, LoopableObject } from '../../utils/three-helpers';

export enum UndergrowthType {
  BUSH = 'bush',
  FERN = 'fern'
}

export class Undergrowth extends THREE.Group {
  constructor(type: UndergrowthType) {
    super();
    
    if (type === UndergrowthType.BUSH) {
      this.createBush();
    } else {
      this.createFerns();
    }
  }
  
  private createBush(): void {
    const bush = new THREE.Mesh(
      new THREE.SphereGeometry(randomRange(0.5, 1.5), 8, 6),
      EnvironmentMaterials.bush
    );
    bush.position.y = 0.3;
    bush.scale.set(1, 0.6, 1);
    bush.castShadow = true;
    this.add(bush);
  }
  
  private createFerns(): void {
    for (let j = 0; j < 3; j++) {
      const fern = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 1.5, 6),
        EnvironmentMaterials.fern
      );
      fern.position.set(
        randomRange(-0.4, 0.4),
        0.75,
        randomRange(-0.4, 0.4)
      );
      fern.rotation.z = randomRange(-0.25, 0.25);
      fern.castShadow = true;
      this.add(fern);
    }
  }
}

export class UndergrowthField {
  private undergrowth: LoopableObject[] = [];
  
  constructor(
    scene: THREE.Scene,
    count: number = 40,
    resetZ: number = -80,
    maxZ: number = 80
  ) {
    for (let i = 0; i < count; i++) {
      const type = Math.random() > 0.5 ? UndergrowthType.BUSH : UndergrowthType.FERN;
      const plant = new Undergrowth(type);
      
      const side = Math.random() > 0.5 ? -1 : 1;
      plant.position.set(
        side * randomRange(2.5, 17.5),
        -1.3,
        (i - count / 2) * 8 + randomRange(-6, 6)
      );
      
      const loopablePlant = createLoopableObject(plant, resetZ, maxZ);
      scene.add(loopablePlant);
      this.undergrowth.push(loopablePlant);
    }
  }
  
  public update(deltaZ: number): void {
    this.undergrowth.forEach(plant => {
      plant.position.z -= deltaZ;
      if (plant.position.z < plant.userData.resetZ!) {
        plant.position.z = plant.userData.maxZ!;
      }
    });
  }
  
  public updateByFrame(totalDistance: number): void {
    const loopDistance = 160; // Distance before undergrowth loops (maxZ - resetZ)
    
    this.undergrowth.forEach((plant, index) => {
      // Store initial position if not already stored
      if (plant.userData.initialZ === undefined) {
        plant.userData.initialZ = plant.position.z;
      }
      
      // Calculate position based on total distance with looping
      const initialZ = plant.userData.initialZ as number;
      const movedDistance = totalDistance % loopDistance;
      plant.position.z = initialZ - movedDistance;
      
      // Handle wrapping
      if (plant.position.z < -80) {
        plant.position.z += loopDistance;
      }
    });
  }
  
  public getUndergrowth(): LoopableObject[] {
    return this.undergrowth;
  }
}