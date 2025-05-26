import * as THREE from 'three';

export interface LightingConfig {
  ambientIntensity?: number;
  directionalIntensity?: number;
  shadowMapSize?: number;
  shadowCameraSize?: number;
}

export class SceneLighting {
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  
  constructor(scene: THREE.Scene, config: LightingConfig = {}) {
    // Ambient light
    this.ambientLight = new THREE.AmbientLight(
      0xffffff,
      config.ambientIntensity ?? 0.6
    );
    scene.add(this.ambientLight);
    
    // Directional light (sun)
    this.directionalLight = new THREE.DirectionalLight(
      0xffffff,
      config.directionalIntensity ?? 0.8
    );
    
    this.setupDirectionalLight(config);
    scene.add(this.directionalLight);
  }
  
  private setupDirectionalLight(config: LightingConfig): void {
    this.directionalLight.position.set(10, 15, 5);
    this.directionalLight.castShadow = true;
    
    const shadowCameraSize = config.shadowCameraSize ?? 20;
    const shadowMapSize = config.shadowMapSize ?? 2048;
    
    // Shadow camera setup
    this.directionalLight.shadow.camera.near = 0.1;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -shadowCameraSize;
    this.directionalLight.shadow.camera.right = shadowCameraSize;
    this.directionalLight.shadow.camera.top = shadowCameraSize;
    this.directionalLight.shadow.camera.bottom = -shadowCameraSize;
    
    // Shadow map quality
    this.directionalLight.shadow.mapSize.width = shadowMapSize;
    this.directionalLight.shadow.mapSize.height = shadowMapSize;
  }
  
  public setAmbientIntensity(intensity: number): void {
    this.ambientLight.intensity = intensity;
  }
  
  public setDirectionalIntensity(intensity: number): void {
    this.directionalLight.intensity = intensity;
  }
  
  public setDirectionalPosition(x: number, y: number, z: number): void {
    this.directionalLight.position.set(x, y, z);
  }
  
  public enableShadows(enabled: boolean): void {
    this.directionalLight.castShadow = enabled;
  }
}