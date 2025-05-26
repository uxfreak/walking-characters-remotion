import * as THREE from 'three';
import { EnvironmentMaterials } from '../../constants/materials';
import { TreeField } from './Trees';
import { MountainRange } from './Mountains';
import { JunglePath } from './Path';
import { UndergrowthField } from './Undergrowth';

export interface JungleEnvironmentElements {
  ground: THREE.Mesh;
  path: JunglePath;
  trees: TreeField;
  mountains: MountainRange;
  undergrowth: UndergrowthField;
}

export class JungleEnvironment {
  private elements: JungleEnvironmentElements;
  
  constructor(scene: THREE.Scene, seed: number = 12345) {
    // Create ground
    const ground = this.createGround();
    scene.add(ground);
    
    // Create environment elements with deterministic seeds
    this.elements = {
      ground,
      path: new JunglePath(scene),
      trees: new TreeField(scene, 60, -80, 80, seed),
      mountains: new MountainRange(scene, -120, 120, seed + 10000),
      undergrowth: new UndergrowthField(scene, 40, -80, 80, seed + 20000)
    };
  }
  
  private createGround(): THREE.Mesh {
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const ground = new THREE.Mesh(groundGeometry, EnvironmentMaterials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.3;
    ground.receiveShadow = true;
    return ground;
  }
  
  public update(walkSpeed: number, deltaTime: number): void {
    const deltaZ = walkSpeed * deltaTime;
    
    // Update ground position
    this.elements.ground.position.z -= deltaZ;
    if (this.elements.ground.position.z < -100) {
      this.elements.ground.position.z += 200;
    }
    
    // Update all environment elements
    this.elements.path.update(deltaZ);
    this.elements.trees.update(deltaZ);
    this.elements.mountains.update(deltaZ);
    this.elements.undergrowth.update(deltaZ);
  }
  
  public updateByFrame(totalDistance: number): void {
    // Update ground position based on total distance
    const groundCycleLength = 200;
    const groundPosition = -totalDistance % groundCycleLength;
    this.elements.ground.position.z = groundPosition;
    
    // Update all environment elements with frame-based positions
    this.elements.path.updateByFrame(totalDistance);
    this.elements.trees.updateByFrame(totalDistance);
    this.elements.mountains.updateByFrame(totalDistance);
    this.elements.undergrowth.updateByFrame(totalDistance);
  }
  
  public getElements(): JungleEnvironmentElements {
    return this.elements;
  }
}