import * as THREE from 'three';
import { CharacterMaterials } from '../../constants/materials';
import { degreesToRadians } from '../../utils/math';
import { CharacterStyle } from '../../data/sceneConfig';

export interface CharacterParts {
  headGroup: THREE.Group;
  mouth: THREE.Mesh;
  leftArmGroup: THREE.Group;
  rightArmGroup: THREE.Group;
  leftForearmGroup: THREE.Group;
  rightForearmGroup: THREE.Group;
  leftLegGroup: THREE.Group;
  rightLegGroup: THREE.Group;
  leftShoe: THREE.Mesh;
  rightShoe: THREE.Mesh;
}

export class Character extends THREE.Group {
  public parts: CharacterParts;
  private style: CharacterStyle;
  
  constructor(style?: CharacterStyle) {
    super();
    
    // Default style if none provided
    this.style = style || {
      name: 'Default',
      primaryColor: '#4f46e5', // Default indigo
      secondaryColor: '#3730a3', // Dark indigo
      hairColor: '#8b4513', // Brown
      skinTone: '#deb887' // Light skin
    };
    
    this.parts = this.createCharacter();
  }
  
  private createCustomMaterials() {
    return {
      shirt: new THREE.MeshPhongMaterial({ color: this.style.primaryColor }),
      pants: new THREE.MeshPhongMaterial({ color: this.style.secondaryColor }),
      skin: new THREE.MeshPhongMaterial({ color: this.style.skinTone }),
      hair: new THREE.MeshPhongMaterial({ color: this.style.hairColor }),
      mouth: CharacterMaterials.mouth,
      nose: CharacterMaterials.nose,
      eyeWhite: CharacterMaterials.eyeWhite,
      pupil: CharacterMaterials.pupil,
      eyeHighlight: CharacterMaterials.eyeHighlight,
      eyebrow: new THREE.MeshPhongMaterial({ color: this.style.hairColor }),
      shoe: CharacterMaterials.shoe
    };
  }
  
  private createCharacter(): CharacterParts {
    // Create custom materials based on style
    const customMaterials = this.createCustomMaterials();
    
    // Torso - shirt
    const torsoShirt = this.createMesh(
      new THREE.CylinderGeometry(0.4, 0.5, 1.2, 16),
      customMaterials.shirt
    );
    torsoShirt.position.y = 0.75;
    this.add(torsoShirt);
    
    // Torso - pants
    const torsoPants = this.createMesh(
      new THREE.CylinderGeometry(0.45, 0.5, 0.9, 16),
      customMaterials.pants
    );
    torsoPants.position.y = 0.15;
    this.add(torsoPants);
    
    // Shoulders/neck
    const shoulders = this.createMesh(
      new THREE.SphereGeometry(0.35, 16, 8),
      customMaterials.skin
    );
    shoulders.position.y = 1.4;
    shoulders.scale.set(1, 0.6, 1);
    this.add(shoulders);
    
    // Create head
    const headGroup = this.createHead(customMaterials);
    this.add(headGroup);
    
    // Create arms
    const { armGroup: leftArmGroup, forearmGroup: leftForearmGroup } = this.createArm('left', customMaterials);
    const { armGroup: rightArmGroup, forearmGroup: rightForearmGroup } = this.createArm('right', customMaterials);
    this.add(leftArmGroup);
    this.add(rightArmGroup);
    
    // Create legs
    const leftLegGroup = this.createLeg('left', customMaterials);
    const rightLegGroup = this.createLeg('right', customMaterials);
    this.add(leftLegGroup);
    this.add(rightLegGroup);
    
    // Create shoes
    const leftShoe = this.createShoe('left', customMaterials);
    const rightShoe = this.createShoe('right', customMaterials);
    this.add(leftShoe);
    this.add(rightShoe);
    
    // Find mouth mesh for animation
    const mouth = headGroup.getObjectByName('mouth') as THREE.Mesh;
    
    return {
      headGroup,
      mouth,
      leftArmGroup,
      rightArmGroup,
      leftForearmGroup,
      rightForearmGroup,
      leftLegGroup,
      rightLegGroup,
      leftShoe,
      rightShoe
    };
  }
  
  private createMesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    return mesh;
  }
  
  private createHead(materials: any): THREE.Group {
    const headGroup = new THREE.Group();
    headGroup.position.y = 2.2;
    
    // Head
    const head = this.createMesh(
      new THREE.SphereGeometry(0.48, 20, 20),
      materials.skin
    );
    headGroup.add(head);
    
    // Hair
    const hair = this.createMesh(
      new THREE.CylinderGeometry(0.48, 0.4, 0.33, 16),
      materials.hair
    );
    hair.position.set(0, 0.4, -0.08);
    hair.rotation.x = degreesToRadians(-3);
    headGroup.add(hair);
    
    // Face features
    this.addFaceFeatures(headGroup, materials);
    
    return headGroup;
  }
  
  private addFaceFeatures(headGroup: THREE.Group, materials: any): void {
    // Mouth
    const mouth = this.createMesh(
      new THREE.SphereGeometry(0.08, 12, 8),
      materials.mouth
    );
    mouth.name = 'mouth';
    mouth.position.set(0, -0.22, 0.45);
    mouth.scale.set(0.7, 0.2, 0.5);
    headGroup.add(mouth);
    
    // Nose
    const nose = this.createMesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      materials.nose
    );
    nose.position.set(0, -0.08, 0.47);
    headGroup.add(nose);
    
    // Eyes
    const eyeGroup = this.createEyes(materials);
    headGroup.add(eyeGroup);
    
    // Eyebrows
    this.createEyebrows(headGroup, materials);
  }
  
  private createEyes(materials: any): THREE.Group {
    const eyeGroup = new THREE.Group();
    
    const eyePositions = [
      { x: -0.14, name: 'left' },
      { x: 0.14, name: 'right' }
    ];
    
    eyePositions.forEach(pos => {
      // Eye white
      const eyeWhite = this.createMesh(
        new THREE.SphereGeometry(0.09, 12, 8),
        materials.eyeWhite
      );
      eyeWhite.position.set(pos.x, 0.08, 0.42);
      eyeWhite.scale.set(1, 0.8, 0.6);
      eyeGroup.add(eyeWhite);
      
      // Pupil
      const pupil = this.createMesh(
        new THREE.SphereGeometry(0.035, 12, 8),
        materials.pupil
      );
      pupil.position.set(pos.x, 0.08, 0.48);
      eyeGroup.add(pupil);
      
      // Highlight
      const highlight = this.createMesh(
        new THREE.SphereGeometry(0.015, 8, 8),
        materials.eyeHighlight
      );
      highlight.position.set(
        pos.x + (pos.name === 'left' ? 0.01 : -0.01), 
        0.09, 
        0.49
      );
      eyeGroup.add(highlight);
    });
    
    return eyeGroup;
  }
  
  private createEyebrows(headGroup: THREE.Group, materials: any): void {
    const eyebrowPositions = [
      { x: -0.14, rotation: 0.1 },
      { x: 0.14, rotation: -0.1 }
    ];
    
    eyebrowPositions.forEach(pos => {
      const eyebrow = this.createMesh(
        new THREE.BoxGeometry(0.1, 0.025, 0.025),
        materials.eyebrow
      );
      eyebrow.position.set(pos.x, 0.18, 0.45);
      eyebrow.rotation.z = pos.rotation;
      headGroup.add(eyebrow);
    });
  }
  
  private createArm(side: 'left' | 'right', materials: any): { armGroup: THREE.Group; forearmGroup: THREE.Group } {
    const armGroup = new THREE.Group();
    const xPos = side === 'left' ? -0.4 : 0.4;
    armGroup.position.set(xPos, 1.2, 0);
    
    // Upper arm
    const upperArm = this.createMesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8),
      materials.skin
    );
    upperArm.position.y = -0.3;
    armGroup.add(upperArm);
    
    // Forearm group
    const forearmGroup = new THREE.Group();
    forearmGroup.position.y = -0.6;
    
    // Forearm
    const forearm = this.createMesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8),
      materials.skin
    );
    forearm.position.y = -0.25;
    forearmGroup.add(forearm);
    
    // Hand
    const hand = this.createMesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      materials.skin
    );
    hand.position.set(0, -0.5, 0);
    hand.scale.set(1, 0.8, 1);
    forearmGroup.add(hand);
    
    armGroup.add(forearmGroup);
    
    return { armGroup, forearmGroup };
  }
  
  private createLeg(side: 'left' | 'right', materials: any): THREE.Group {
    const legGroup = new THREE.Group();
    const xPos = side === 'left' ? -0.2 : 0.2;
    legGroup.position.set(xPos, 0, 0);
    
    const leg = this.createMesh(
      new THREE.CylinderGeometry(0.15, 0.18, 1.2, 12),
      materials.pants
    );
    leg.position.y = -0.6;
    legGroup.add(leg);
    
    return legGroup;
  }
  
  private createShoe(side: 'left' | 'right', materials: any): THREE.Mesh {
    const shoe = this.createMesh(
      new THREE.BoxGeometry(0.3, 0.1, 0.5),
      materials.shoe
    );
    const xPos = side === 'left' ? -0.2 : 0.2;
    shoe.position.set(xPos, -1.25, 0);
    return shoe;
  }
}