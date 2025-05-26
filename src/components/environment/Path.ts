import * as THREE from 'three';
import { EnvironmentMaterials } from '../../constants/materials';
import { createLoopableObject, LoopableObject } from '../../utils/three-helpers';

export class JunglePath {
  private pathSegments: LoopableObject[] = [];
  private segmentLength: number = 40;
  private numSegments: number = 6;
  
  constructor(scene: THREE.Scene) {
    this.createPath(scene);
  }
  
  private createPath(scene: THREE.Scene): void {
    for (let i = 0; i < this.numSegments; i++) {
      const pathGeometry = new THREE.PlaneGeometry(3, this.segmentLength);
      const pathSegment = new THREE.Mesh(pathGeometry, EnvironmentMaterials.path);
      
      pathSegment.rotation.x = -Math.PI / 2;
      pathSegment.position.set(
        0, 
        -1.29, 
        (i - this.numSegments / 2) * this.segmentLength * 0.8
      );
      pathSegment.receiveShadow = true;
      
      const loopableSegment = createLoopableObject(pathSegment, -120, 120);
      scene.add(loopableSegment);
      this.pathSegments.push(loopableSegment);
    }
  }
  
  public update(deltaZ: number): void {
    this.pathSegments.forEach(segment => {
      segment.position.z -= deltaZ;
      if (segment.position.z < segment.userData.resetZ!) {
        segment.position.z = segment.userData.maxZ!;
      }
    });
  }
  
  public updateByFrame(totalDistance: number): void {
    const loopDistance = this.segmentLength * this.numSegments * 0.8; // Total loop distance
    
    this.pathSegments.forEach((segment, index) => {
      // Store initial position if not already stored
      if (segment.userData.initialZ === undefined) {
        segment.userData.initialZ = (index - this.numSegments / 2) * this.segmentLength * 0.8;
      }
      
      // Calculate position based on total distance with looping
      const offsetZ = segment.userData.initialZ as number;
      segment.position.z = offsetZ - (totalDistance % loopDistance);
      
      // Handle wrapping
      if (segment.position.z < -loopDistance / 2) {
        segment.position.z += loopDistance;
      }
    });
  }
  
  public getSegments(): LoopableObject[] {
    return this.pathSegments;
  }
}