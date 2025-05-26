import * as THREE from 'three';
import { clamp } from '../../utils/math';

export interface OrbitControlsConfig {
  target?: THREE.Vector3;
  minDistance?: number;
  maxDistance?: number;
  rotateSpeed?: number;
  zoomSpeed?: number;
}

export class OrbitControls {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private target: THREE.Vector3;
  private minDistance: number;
  private maxDistance: number;
  private rotateSpeed: number;
  private zoomSpeed: number;
  
  private spherical: THREE.Spherical;
  private sphericalDelta: THREE.Spherical;
  
  private mouseDown: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  
  constructor(camera: THREE.Camera, domElement: HTMLElement, config: OrbitControlsConfig = {}) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = config.target || new THREE.Vector3(0, 2, 0);
    this.minDistance = config.minDistance || 5;
    this.maxDistance = config.maxDistance || 20;
    this.rotateSpeed = config.rotateSpeed || 0.01;
    this.zoomSpeed = config.zoomSpeed || 0.001;
    
    this.spherical = new THREE.Spherical();
    this.sphericalDelta = new THREE.Spherical();
    
    this.bindEvents();
    this.update();
  }
  
  private bindEvents(): void {
    this.domElement.addEventListener('mousedown', this.onMouseDown);
    this.domElement.addEventListener('mouseup', this.onMouseUp);
    this.domElement.addEventListener('mousemove', this.onMouseMove);
    this.domElement.addEventListener('wheel', this.onWheel);
  }
  
  private onMouseDown = (e: MouseEvent): void => {
    this.mouseDown = true;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  };
  
  private onMouseUp = (): void => {
    this.mouseDown = false;
  };
  
  private onMouseMove = (e: MouseEvent): void => {
    if (!this.mouseDown) return;
    
    const deltaX = e.clientX - this.mouseX;
    const deltaY = e.clientY - this.mouseY;
    
    this.sphericalDelta.theta = -deltaX * this.rotateSpeed;
    this.sphericalDelta.phi = -deltaY * this.rotateSpeed;
    
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  };
  
  private onWheel = (e: WheelEvent): void => {
    const delta = e.deltaY * this.zoomSpeed;
    this.spherical.radius *= 1 + delta;
    this.spherical.radius = clamp(this.spherical.radius, this.minDistance, this.maxDistance);
  };
  
  public update(): void {
    const offset = new THREE.Vector3();
    offset.copy(this.camera.position).sub(this.target);
    
    this.spherical.setFromVector3(offset);
    this.spherical.theta += this.sphericalDelta.theta;
    this.spherical.phi += this.sphericalDelta.phi;
    
    this.spherical.phi = clamp(this.spherical.phi, 0.1, Math.PI - 0.1);
    
    this.sphericalDelta.set(0, 0, 0);
    
    offset.setFromSpherical(this.spherical);
    this.camera.position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);
  }
  
  public setTarget(target: THREE.Vector3): void {
    this.target.copy(target);
  }
  
  public dispose(): void {
    this.domElement.removeEventListener('mousedown', this.onMouseDown);
    this.domElement.removeEventListener('mouseup', this.onMouseUp);
    this.domElement.removeEventListener('mousemove', this.onMouseMove);
    this.domElement.removeEventListener('wheel', this.onWheel);
  }
}