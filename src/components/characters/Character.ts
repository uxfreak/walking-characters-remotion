import * as THREE from 'three';
import { CharacterMaterials } from '../../constants/materials';
import { degreesToRadians } from '../../utils/math';

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
  
  constructor() {
    super();
    this.parts = this.createCharacter();
  }
  
  private createCharacter(): CharacterParts {
    // Torso - shirt
    const torsoShirt = this.createMesh(
      new THREE.CylinderGeometry(0.4, 0.5, 1.2, 16),
      CharacterMaterials.shirt
    );
    torsoShirt.position.y = 0.75;
    this.add(torsoShirt);
    
    // Torso - pants
    const torsoPants = this.createMesh(
      new THREE.CylinderGeometry(0.45, 0.5, 0.9, 16),
      CharacterMaterials.pants
    );
    torsoPants.position.y = 0.15;
    this.add(torsoPants);
    
    // Shoulders/neck
    const shoulders = this.createMesh(
      new THREE.SphereGeometry(0.35, 16, 8),
      CharacterMaterials.skin
    );
    shoulders.position.y = 1.4;
    shoulders.scale.set(1, 0.6, 1);
    this.add(shoulders);
    
    // Create head
    const headGroup = this.createHead();
    this.add(headGroup);
    
    // Create arms
    const { leftArmGroup, leftForearmGroup } = this.createArm('left');
    const { rightArmGroup, rightForearmGroup } = this.createArm('right');
    this.add(leftArmGroup);
    this.add(rightArmGroup);
    
    // Create legs
    const leftLegGroup = this.createLeg('left');
    const rightLegGroup = this.createLeg('right');
    this.add(leftLegGroup);
    this.add(rightLegGroup);
    
    // Create shoes
    const leftShoe = this.createShoe('left');
    const rightShoe = this.createShoe('right');
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
  
  private createHead(): THREE.Group {
    const headGroup = new THREE.Group();
    headGroup.position.y = 2.2;
    
    // Head
    const head = this.createMesh(
      new THREE.SphereGeometry(0.48, 20, 20),
      CharacterMaterials.skin
    );
    headGroup.add(head);
    
    // Hair
    const hair = this.createMesh(
      new THREE.CylinderGeometry(0.48, 0.4, 0.33, 16),
      CharacterMaterials.hair
    );
    hair.position.set(0, 0.4, -0.08);
    hair.rotation.x = degreesToRadians(-3);
    headGroup.add(hair);
    
    // Face features
    this.addFaceFeatures(headGroup);
    
    return headGroup;
  }
  
  private addFaceFeatures(headGroup: THREE.Group): void {
    // Mouth
    const mouth = this.createMesh(
      new THREE.SphereGeometry(0.08, 12, 8),
      CharacterMaterials.mouth
    );
    mouth.name = 'mouth';
    mouth.position.set(0, -0.22, 0.45);
    mouth.scale.set(0.7, 0.2, 0.5);
    headGroup.add(mouth);
    
    // Nose
    const nose = this.createMesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      CharacterMaterials.nose
    );
    nose.position.set(0, -0.08, 0.47);
    headGroup.add(nose);
    
    // Eyes
    const eyeGroup = this.createEyes();
    headGroup.add(eyeGroup);
    
    // Eyebrows
    this.createEyebrows(headGroup);
  }
  
  private createEyes(): THREE.Group {
    const eyeGroup = new THREE.Group();
    
    const eyePositions = [
      { x: -0.14, name: 'left' },
      { x: 0.14, name: 'right' }
    ];
    
    eyePositions.forEach(pos => {
      // Eye white
      const eyeWhite = this.createMesh(
        new THREE.SphereGeometry(0.09, 12, 8),
        CharacterMaterials.eyeWhite
      );
      eyeWhite.position.set(pos.x, 0.08, 0.42);
      eyeWhite.scale.set(1, 0.8, 0.6);
      eyeGroup.add(eyeWhite);
      
      // Pupil
      const pupil = this.createMesh(
        new THREE.SphereGeometry(0.035, 12, 8),
        CharacterMaterials.pupil
      );
      pupil.position.set(pos.x, 0.08, 0.48);
      eyeGroup.add(pupil);
      
      // Highlight
      const highlight = this.createMesh(
        new THREE.SphereGeometry(0.015, 8, 8),
        CharacterMaterials.eyeHighlight
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
  
  private createEyebrows(headGroup: THREE.Group): void {
    const eyebrowPositions = [
      { x: -0.14, rotation: 0.1 },
      { x: 0.14, rotation: -0.1 }
    ];
    
    eyebrowPositions.forEach(pos => {
      const eyebrow = this.createMesh(
        new THREE.BoxGeometry(0.1, 0.025, 0.025),
        CharacterMaterials.eyebrow
      );
      eyebrow.position.set(pos.x, 0.18, 0.45);
      eyebrow.rotation.z = pos.rotation;
      headGroup.add(eyebrow);
    });
  }
  
  private createArm(side: 'left' | 'right'): { armGroup: THREE.Group; forearmGroup: THREE.Group } {
    const armGroup = new THREE.Group();
    const xPos = side === 'left' ? -0.4 : 0.4;
    armGroup.position.set(xPos, 1.2, 0);
    
    // Upper arm
    const upperArm = this.createMesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8),
      CharacterMaterials.skin
    );
    upperArm.position.y = -0.3;
    armGroup.add(upperArm);
    
    // Forearm group
    const forearmGroup = new THREE.Group();
    forearmGroup.position.y = -0.6;
    
    // Forearm
    const forearm = this.createMesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8),
      CharacterMaterials.skin
    );
    forearm.position.y = -0.25;
    forearmGroup.add(forearm);
    
    // Hand
    const hand = this.createMesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      CharacterMaterials.skin
    );
    hand.position.set(0, -0.5, 0);
    hand.scale.set(1, 0.8, 1);
    forearmGroup.add(hand);
    
    armGroup.add(forearmGroup);
    
    return { armGroup, forearmGroup };
  }
  
  private createLeg(side: 'left' | 'right'): THREE.Group {
    const legGroup = new THREE.Group();
    const xPos = side === 'left' ? -0.2 : 0.2;
    legGroup.position.set(xPos, 0, 0);
    
    const leg = this.createMesh(
      new THREE.CylinderGeometry(0.15, 0.18, 1.2, 12),
      CharacterMaterials.pants
    );
    leg.position.y = -0.6;
    legGroup.add(leg);
    
    return legGroup;
  }
  
  private createShoe(side: 'left' | 'right'): THREE.Mesh {
    const shoe = this.createMesh(
      new THREE.BoxGeometry(0.3, 0.1, 0.5),
      CharacterMaterials.shoe
    );
    const xPos = side === 'left' ? -0.2 : 0.2;
    shoe.position.set(xPos, -1.25, 0);
    return shoe;
  }
}