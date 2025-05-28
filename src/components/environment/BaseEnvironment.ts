import * as THREE from 'three';

export interface EnvironmentConfig {
  backgroundColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  groundColor: number;
  pathColor: number;
  enableShadows: boolean;
}

export interface EnvironmentElements {
  ground: THREE.Mesh;
  path: any; // Will be specific to each environment
  updateByFrame: (totalDistance: number) => void;
}

export abstract class BaseEnvironment {
  protected scene: THREE.Scene;
  protected config: EnvironmentConfig;
  protected seed: number;
  protected random: () => number;
  
  constructor(scene: THREE.Scene, config: EnvironmentConfig, seed: number = 12345) {
    this.scene = scene;
    this.config = config;
    this.seed = seed;
    this.random = this.createSeededRandom(seed);
  }
  
  protected createSeededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
  }
  
  protected createGround(material: THREE.Material): THREE.Mesh {
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const ground = new THREE.Mesh(groundGeometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.3;
    ground.receiveShadow = this.config.enableShadows;
    return ground;
  }
  
  abstract updateByFrame(totalDistance: number): void;
  abstract getConfig(): EnvironmentConfig;
}