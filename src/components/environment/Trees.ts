import * as THREE from 'three';
import { TreeMaterials } from '../../constants/materials';
import { randomRange } from '../../utils/math';
import { createLoopableObject, LoopableObject } from '../../utils/three-helpers';

export enum TreeType {
  TALL_JUNGLE = 0,
  BROAD_JUNGLE = 1,
  VINE_COVERED = 2
}

export interface TreeConfig {
  type?: TreeType;
  minHeight?: number;
  maxHeight?: number;
  position?: THREE.Vector3;
  resetZ?: number;
  maxZ?: number;
}

export class Tree extends THREE.Group {
  constructor(config: TreeConfig = {}) {
    super();
    
    const type = config.type ?? Math.floor(Math.random() * 3);
    const trunkMaterial = TreeMaterials.trunks[Math.floor(Math.random() * TreeMaterials.trunks.length)];
    const foliageMaterial = TreeMaterials.foliage[Math.floor(Math.random() * TreeMaterials.foliage.length)];
    
    switch (type) {
      case TreeType.TALL_JUNGLE:
        this.createTallJungleTree(trunkMaterial, foliageMaterial, config);
        break;
      case TreeType.BROAD_JUNGLE:
        this.createBroadJungleTree(trunkMaterial, foliageMaterial, config);
        break;
      case TreeType.VINE_COVERED:
        this.createVineCoveredTree(trunkMaterial, foliageMaterial, config);
        break;
    }
    
    // Random rotation
    this.rotation.y = Math.random() * Math.PI * 2;
    
    // Set position if provided
    if (config.position) {
      this.position.copy(config.position);
    }
  }
  
  private createMesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    return mesh;
  }
  
  private createTallJungleTree(
    trunkMaterial: THREE.Material,
    foliageMaterial: THREE.Material,
    config: TreeConfig
  ): void {
    const minHeight = config.minHeight ?? 8;
    const maxHeight = config.maxHeight ?? 20;
    const trunkHeight = randomRange(minHeight, maxHeight);
    const trunkRadius = randomRange(0.4, 1);
    
    // Trunk
    const trunk = this.createMesh(
      new THREE.CylinderGeometry(trunkRadius * 0.7, trunkRadius, trunkHeight, 8),
      trunkMaterial
    );
    trunk.position.y = trunkHeight / 2 - 1.3;
    this.add(trunk);
    
    // Canopy
    const foliageRadius = randomRange(3, 5);
    const canopy = this.createMesh(
      new THREE.SphereGeometry(foliageRadius, 10, 8),
      foliageMaterial
    );
    canopy.position.y = trunkHeight - 1.3 - foliageRadius * 0.3;
    canopy.scale.set(1, 0.7, 1);
    this.add(canopy);
  }
  
  private createBroadJungleTree(
    trunkMaterial: THREE.Material,
    foliageMaterial: THREE.Material,
    config: TreeConfig
  ): void {
    const minHeight = config.minHeight ?? 7;
    const maxHeight = config.maxHeight ?? 15;
    const trunkHeight = randomRange(minHeight, maxHeight);
    const trunkRadius = randomRange(0.5, 0.9);
    
    // Trunk
    const trunk = this.createMesh(
      new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 8),
      trunkMaterial
    );
    trunk.position.y = trunkHeight / 2 - 1.3;
    this.add(trunk);
    
    // Wide canopy
    const canopyRadius = randomRange(4, 6);
    const canopy = this.createMesh(
      new THREE.SphereGeometry(canopyRadius, 10, 6),
      foliageMaterial
    );
    canopy.position.y = trunkHeight - 1.3 - canopyRadius * 0.4;
    canopy.scale.set(1.3, 0.5, 1.3);
    this.add(canopy);
    
    // Additional smaller canopies
    for (let j = 0; j < 2; j++) {
      const smallCanopyRadius = randomRange(1.5, 2.3);
      const smallCanopy = this.createMesh(
        new THREE.SphereGeometry(smallCanopyRadius, 8, 6),
        foliageMaterial
      );
      const angle = j * Math.PI;
      smallCanopy.position.set(
        Math.cos(angle) * canopyRadius * 0.7,
        trunkHeight - 1.3 - smallCanopyRadius * 0.6,
        Math.sin(angle) * canopyRadius * 0.7
      );
      smallCanopy.scale.set(0.9, 0.6, 0.9);
      this.add(smallCanopy);
    }
  }
  
  private createVineCoveredTree(
    trunkMaterial: THREE.Material,
    foliageMaterial: THREE.Material,
    config: TreeConfig
  ): void {
    const minHeight = config.minHeight ?? 8;
    const maxHeight = config.maxHeight ?? 18;
    const trunkHeight = randomRange(minHeight, maxHeight);
    const trunkRadius = randomRange(0.3, 0.6);
    
    // Trunk
    const trunk = this.createMesh(
      new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.1, trunkHeight, 8),
      trunkMaterial
    );
    trunk.position.y = trunkHeight / 2 - 1.3;
    this.add(trunk);
    
    // Irregular foliage
    const foliageRadius = randomRange(2.5, 4);
    const mainFoliage = this.createMesh(
      new THREE.SphereGeometry(foliageRadius, 8, 6),
      foliageMaterial
    );
    mainFoliage.position.y = trunkHeight - 1.3 - foliageRadius * 0.4;
    mainFoliage.scale.set(1, 0.8, 1);
    this.add(mainFoliage);
    
    // Hanging vines
    const vineMaterial = new THREE.MeshPhongMaterial({ color: 0x556B2F });
    for (let j = 0; j < 3; j++) {
      const vineLength = randomRange(1, 3);
      const vine = this.createMesh(
        new THREE.CylinderGeometry(0.02, 0.05, vineLength, 6),
        vineMaterial
      );
      const vineStartHeight = mainFoliage.position.y - foliageRadius * 0.5;
      vine.position.set(
        (Math.random() - 0.5) * foliageRadius * 1.5,
        vineStartHeight - vineLength / 2,
        (Math.random() - 0.5) * foliageRadius * 1.5
      );
      this.add(vine);
    }
  }
}

export class TreeField {
  private trees: LoopableObject[] = [];
  
  constructor(
    scene: THREE.Scene,
    count: number = 60,
    resetZ: number = -80,
    maxZ: number = 80
  ) {
    for (let i = 0; i < count; i++) {
      const treeType = Math.floor(Math.random() * 3) as TreeType;
      const tree = new Tree({ type: treeType });
      
      // Position trees in jungle
      const side = Math.random() > 0.5 ? -1 : 1;
      const distanceFromPath = randomRange(3, 23);
      const spreadZ = (i - count / 2) * 6 + randomRange(-7.5, 7.5);
      
      tree.position.set(
        side * distanceFromPath + randomRange(-2.5, 2.5),
        -1.3,
        spreadZ
      );
      
      const loopableTree = createLoopableObject(tree, resetZ, maxZ);
      scene.add(loopableTree);
      this.trees.push(loopableTree);
    }
  }
  
  public update(deltaZ: number): void {
    this.trees.forEach(tree => {
      tree.position.z -= deltaZ;
      if (tree.position.z < tree.userData.resetZ!) {
        tree.position.z = tree.userData.maxZ!;
      }
    });
  }
  
  public updateByFrame(totalDistance: number): void {
    const loopDistance = 160; // Distance before trees loop (resetZ - maxZ)
    
    this.trees.forEach((tree, index) => {
      // Store initial position if not already stored
      if (tree.userData.initialZ === undefined) {
        tree.userData.initialZ = tree.position.z;
      }
      
      // Calculate position based on total distance with looping
      const initialZ = tree.userData.initialZ as number;
      const movedDistance = totalDistance % loopDistance;
      tree.position.z = initialZ - movedDistance;
      
      // Handle wrapping
      if (tree.position.z < -80) {
        tree.position.z += loopDistance;
      }
    });
  }
  
  public getTrees(): LoopableObject[] {
    return this.trees;
  }
}