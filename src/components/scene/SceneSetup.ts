import * as THREE from 'three';
import { SceneLighting } from './Lighting';

export interface SceneConfig {
  backgroundColor?: number;
  fogColor?: number;
  fogNear?: number;
  fogFar?: number;
  enableShadows?: boolean;
  shadowType?: THREE.ShadowMapType;
}

export class SceneSetup {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public lighting: SceneLighting;
  
  constructor(config: SceneConfig = {}) {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(config.backgroundColor ?? 0x8FBC8F);
    
    // Add fog
    if (config.fogColor !== undefined) {
      this.scene.fog = new THREE.Fog(
        config.fogColor ?? 0x7A9B7A,
        config.fogNear ?? 25,
        config.fogFar ?? 80
      );
    }
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      16 / 9, // Default aspect ratio
      0.1,
      1000
    );
    this.camera.position.set(-3, 4, 8);
    
    // Create renderer with fallback for headless rendering
    try {
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        preserveDrawingBuffer: true, // Important for Remotion
        powerPreference: 'high-performance'
      });
    } catch (error) {
      console.warn('WebGL not available, falling back to Canvas renderer');
      // For headless environments, we need to handle this differently
      throw new Error('WebGL context creation failed. Make sure to use --gl=angle or --gl=swiftshader when rendering.');
    }
    
    this.renderer.setPixelRatio(1); // Fixed pixel ratio for Remotion
    this.renderer.shadowMap.enabled = config.enableShadows ?? true;
    this.renderer.shadowMap.type = config.shadowType ?? THREE.PCFSoftShadowMap;
    
    // Setup lighting
    this.lighting = new SceneLighting(this.scene);
    
    // Don't setup resize handler for Remotion
  }
  
  private setupResizeHandler(): void {
    // Not needed for Remotion
  }
  
  private handleResize = (): void => {
    // Not needed for Remotion
  };
  
  public mount(container: HTMLElement): void {
    container.appendChild(this.renderer.domElement);
    // Set size based on container dimensions
    const rect = container.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    
    // Ensure canvas fills container
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
  }
  
  public unmount(container: HTMLElement): void {
    if (container.contains(this.renderer.domElement)) {
      container.removeChild(this.renderer.domElement);
    }
  }
  
  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  
  public dispose(): void {
    this.renderer.dispose();
  }
}