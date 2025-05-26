import { Character } from './Character';
import { degreesToRadians } from '../../utils/math';

export interface AnimationState {
  walkPhase: number;
  talkPhase: number;
  gesturePhase: number;
}

export enum Speaker {
  NONE = 'none',
  CHARACTER_1 = 'character1',
  CHARACTER_2 = 'character2',
  BOTH = 'both'
}

export class CharacterAnimations {
  private character: Character;
  private walkOffset: number;
  private animationSpeed: number;
  
  constructor(character: Character, walkOffset: number = 0, animationSpeed: number = 1) {
    this.character = character;
    this.walkOffset = walkOffset;
    this.animationSpeed = animationSpeed;
  }
  
  public update(
    time: number, 
    characterIndex: number = 0,
    currentSpeaker: Speaker = Speaker.NONE
  ): void {
    const state: AnimationState = {
      walkPhase: time * 4 * this.animationSpeed + this.walkOffset,
      talkPhase: time * 3 + characterIndex * Math.PI * 0.7,
      gesturePhase: time * (characterIndex === 0 ? 0.7 : 1.1) + characterIndex * Math.PI
    };
    
    // Determine if this character is speaking
    const isSpeaking = this.isCharacterSpeaking(characterIndex, currentSpeaker);
    const otherIsSpeaking = this.isOtherCharacterSpeaking(characterIndex, currentSpeaker);
    
    this.animateWalkCycle(state);
    this.animateUpperBody(state, characterIndex, isSpeaking);
    this.animateFace(state, characterIndex, time, isSpeaking, otherIsSpeaking);
  }
  
  private isCharacterSpeaking(characterIndex: number, currentSpeaker: Speaker): boolean {
    return (
      currentSpeaker === Speaker.BOTH ||
      (characterIndex === 0 && currentSpeaker === Speaker.CHARACTER_1) ||
      (characterIndex === 1 && currentSpeaker === Speaker.CHARACTER_2)
    );
  }
  
  private isOtherCharacterSpeaking(characterIndex: number, currentSpeaker: Speaker): boolean {
    return (
      currentSpeaker === Speaker.BOTH ||
      (characterIndex === 0 && currentSpeaker === Speaker.CHARACTER_2) ||
      (characterIndex === 1 && currentSpeaker === Speaker.CHARACTER_1)
    );
  }
  
  private animateWalkCycle(state: AnimationState): void {
    const { walkPhase } = state;
    const { parts } = this.character;
    
    if (!parts) return; // Safety check
    
    // Body bob
    this.character.position.y = Math.sin(walkPhase * 2) * 0.05;
    
    // Body sway
    this.character.rotation.z = Math.sin(walkPhase) * 0.02;
    
    // Leg animation
    if (parts.leftLegGroup && parts.rightLegGroup) {
      const legSwing = Math.sin(walkPhase) * 15;
      parts.leftLegGroup.rotation.x = degreesToRadians(legSwing);
      parts.rightLegGroup.rotation.x = degreesToRadians(-legSwing);
    }
    
    // Foot animation
    if (parts.leftShoe && parts.rightShoe) {
      const footLift = Math.max(0, Math.sin(walkPhase)) * 0.1;
      const footLiftOpposite = Math.max(0, Math.sin(walkPhase + Math.PI)) * 0.1;
      
      parts.leftShoe.position.y = -1.25 + footLift;
      parts.rightShoe.position.y = -1.25 + footLiftOpposite;
    }
  }
  
  private animateUpperBody(
    state: AnimationState, 
    characterIndex: number,
    isSpeaking: boolean
  ): void {
    const { walkPhase, gesturePhase } = state;
    const { parts } = this.character;
    
    if (!parts) return; // Safety check
    
    // Arm swinging with more gestures when speaking
    const armSwing = Math.sin(walkPhase + Math.PI) * 25;
    const gestureAmplitude = isSpeaking ? 30 : 20;
    const gesture = Math.sin(gesturePhase) * gestureAmplitude;
    
    if (parts.leftArmGroup) {
      parts.leftArmGroup.rotation.x = degreesToRadians(-15 + armSwing + gesture);
      parts.leftArmGroup.rotation.z = degreesToRadians(-20 + Math.sin(gesturePhase) * 10);
    }
    
    if (parts.rightArmGroup) {
      parts.rightArmGroup.rotation.x = degreesToRadians(-15 - armSwing + gesture * 0.7);
      parts.rightArmGroup.rotation.z = degreesToRadians(15 + Math.sin(gesturePhase + Math.PI) * 10);
    }
    
    // Forearm gestures - more animated when speaking
    const forearmMultiplier = isSpeaking ? 20 : 15;
    if (parts.leftForearmGroup) {
      parts.leftForearmGroup.rotation.x = degreesToRadians(5 + Math.sin(gesturePhase * 1.2) * forearmMultiplier);
    }
    if (parts.rightForearmGroup) {
      parts.rightForearmGroup.rotation.x = degreesToRadians(5 + Math.sin(gesturePhase * 0.9 + Math.PI) * forearmMultiplier);
    }
  }
  
  private animateFace(
    state: AnimationState, 
    characterIndex: number, 
    time: number,
    isSpeaking: boolean,
    otherIsSpeaking: boolean
  ): void {
    const { walkPhase, talkPhase } = state;
    const { parts } = this.character;
    
    if (!parts) return; // Safety check
    
    // Head movement
    let lookDirection: number;
    let headTurnAmount: number;
    
    if (otherIsSpeaking && !isSpeaking) {
      // Look more directly at the other character when they're speaking
      lookDirection = characterIndex === 0 ? 20 : -20;
      headTurnAmount = 12;
    } else if (isSpeaking) {
      // Look somewhat at the other character but also gesture forward
      lookDirection = characterIndex === 0 ? 10 : -10;
      headTurnAmount = 15;
    } else {
      // Normal conversation position
      lookDirection = characterIndex === 0 ? 15 : -15;
      headTurnAmount = 8;
    }
    
    const headBob = Math.sin(walkPhase * 2) * 2;
    const occasionalNod = Math.sin(time * 0.3 + characterIndex * Math.PI) * 5;
    
    // More animated head movement when speaking
    const speakingNod = isSpeaking ? Math.sin(time * 2.5) * 3 : 0;
    
    if (parts.headGroup) {
      parts.headGroup.rotation.y = degreesToRadians(lookDirection + Math.sin(time * 0.5 + characterIndex) * headTurnAmount);
      parts.headGroup.rotation.x = degreesToRadians(headBob + occasionalNod + speakingNod);
    }
    
    // Mouth animation - only animate when speaking
    if (parts.mouth) {
      if (isSpeaking) {
        // More complex talking animation
        const talking = Math.abs(Math.sin(talkPhase * 4)) * 0.15 + 
                       Math.abs(Math.sin(talkPhase * 7)) * 0.05;
        parts.mouth.scale.y = 0.2 + talking;
        parts.mouth.scale.z = 0.5 + talking * 0.3; // Slight depth change
      } else {
        // Closed mouth when not speaking
        parts.mouth.scale.y = 0.2;
        parts.mouth.scale.z = 0.5;
      }
    }
  }
  
  public setWalkOffset(offset: number): void {
    this.walkOffset = offset;
  }
  
  public setAnimationSpeed(speed: number): void {
    this.animationSpeed = speed;
  }
}