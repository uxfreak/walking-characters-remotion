import * as THREE from "three";
import { BaseEnvironment, EnvironmentConfig } from "./BaseEnvironment";
import { JunglePath } from "./Path";
import { MountainRange } from "./Mountains";

export const DesertConfig: EnvironmentConfig = {
  backgroundColor: 0xffe5b4, // Peach/sunset sky
  fogColor: 0xffd700, // Golden fog
  fogNear: 35,
  fogFar: 90,
  groundColor: 0xf4a460, // Sandy brown
  pathColor: 0xdeb887, // Burlywood (packed sand)
  enableShadows: true,
};

// Desert materials
export const DesertMaterials = {
  sand: new THREE.MeshPhongMaterial({
    color: 0xf4a460,
    shininess: 5,
  }),
  packedSand: new THREE.MeshPhongMaterial({
    color: 0xdeb887,
    shininess: 10,
  }),
  cactusGreen: new THREE.MeshPhongMaterial({
    color: 0x228b22,
    shininess: 15,
  }),
  rock: new THREE.MeshPhongMaterial({
    color: 0x8b7355,
    shininess: 5,
  }),
  redRock: new THREE.MeshPhongMaterial({
    color: 0xcd5c5c,
  }),
};

class Cactus {
  private mesh: THREE.Group;
  private random: () => number;

  constructor(
    x: number,
    z: number,
    type: "saguaro" | "barrel" | "prickly",
    random: () => number
  ) {
    this.mesh = new THREE.Group();
    this.random = random;

    switch (type) {
      case "saguaro":
        this.createSaguaro();
        break;
      case "barrel":
        this.createBarrel();
        break;
      case "prickly":
        this.createPricklyPear();
        break;
    }

    this.mesh.position.set(x, -1.3, z); // Position on ground level
    this.mesh.castShadow = true;
  }

  private createSaguaro(): void {
    // Main trunk - rounded capsule shape
    const trunkHeight = 6 + this.random() * 2;
    const trunkRadius = 0.6 + this.random() * 0.3;

    // Create capsule using cylinder with spheres on ends
    const trunkGeometry = new THREE.CylinderGeometry(
      trunkRadius,
      trunkRadius,
      trunkHeight,
      12
    );
    const trunk = new THREE.Mesh(trunkGeometry, DesertMaterials.cactusGreen);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    this.mesh.add(trunk);

    // Rounded top
    const topSphere = new THREE.Mesh(
      new THREE.SphereGeometry(trunkRadius, 12, 8),
      DesertMaterials.cactusGreen
    );
    topSphere.position.y = trunkHeight;
    topSphere.castShadow = true;
    this.mesh.add(topSphere);

    // Add thorns to trunk (temporarily disabled for testing)
    // this.addThorns(trunk, trunkRadius, trunkHeight, 20);

    // Arms - also capsule shaped
    const numArms = Math.floor(this.random() * 3) + 1; // 1-3 arms

    for (let i = 0; i < numArms; i++) {
      const armHeight = 2 + this.random() * 2;
      const armRadius = trunkRadius * 0.7;
      const armY = trunkHeight * (0.4 + this.random() * 0.4);
      const armAngle = (this.random() - 0.5) * Math.PI;
      const armDistance = trunkRadius + 0.3;

      // Arm cylinder
      const armGeometry = new THREE.CylinderGeometry(
        armRadius,
        armRadius,
        armHeight,
        10
      );
      const arm = new THREE.Mesh(armGeometry, DesertMaterials.cactusGreen);

      // Position arm
      const side = i % 2 === 0 ? 1 : -1;
      arm.position.set(
        side * (armDistance + armHeight * 0.3),
        armY + armHeight * 0.3,
        (this.random() - 0.5) * 0.5
      );
      arm.rotation.z = side * (Math.PI / 6 + (this.random() * Math.PI) / 6);
      arm.castShadow = true;
      this.mesh.add(arm);

      // Arm top sphere
      const armTop = new THREE.Mesh(
        new THREE.SphereGeometry(armRadius, 10, 6),
        DesertMaterials.cactusGreen
      );
      armTop.position.copy(arm.position);
      armTop.position.y += armHeight * 0.5;
      armTop.castShadow = true;
      this.mesh.add(armTop);

      // Add thorns to arm
      this.addThorns(arm, armRadius, armHeight, 8);
    }
  }

  private createBarrel(): void {
    const radius = 1.2 + this.random() * 0.6;
    const height = radius * 1.2;

    // Main barrel body - slightly flattened sphere
    const geometry = new THREE.SphereGeometry(radius, 12, 8);
    const cactus = new THREE.Mesh(geometry, DesertMaterials.cactusGreen);
    cactus.position.y = height;
    cactus.scale.y = 0.9; // Slightly flatten
    cactus.castShadow = true;
    this.mesh.add(cactus);

    // Add ridged thorns around the barrel
    this.addBarrelThorns(cactus, radius);
  }

  private createPricklyPear(): void {
    // Create rounded paddle shapes
    const numPaddles = 2 + Math.floor(this.random() * 2); // 2-3 paddles

    for (let i = 0; i < numPaddles; i++) {
      const width = 1.2 + this.random() * 0.4;
      const height = 1.5 + this.random() * 0.5;
      const thickness = 0.4 + this.random() * 0.2;

      // Create rounded paddle using flattened sphere
      const paddleGeometry = new THREE.SphereGeometry(
        Math.max(width, height) * 0.6,
        12,
        8
      );
      const paddle = new THREE.Mesh(
        paddleGeometry,
        DesertMaterials.cactusGreen
      );

      // Scale to make it paddle-shaped
      paddle.scale.set(width / 0.6, height / 0.6, thickness / 0.6);

      // Position paddles
      const baseY = thickness;
      paddle.position.set(
        (i - numPaddles / 2) * width * 0.7,
        baseY + i * height * 0.3,
        this.random() * 0.3 - 0.15
      );

      // Slight rotation for natural look
      paddle.rotation.z = (this.random() - 0.5) * 0.2;
      paddle.rotation.y = (this.random() - 0.5) * 0.3;
      paddle.castShadow = true;
      this.mesh.add(paddle);

      // Add small thorns to paddles
      this.addPaddleThorns(paddle, width, height);
    }
  }

  private addThorns(
    parent: THREE.Mesh,
    radius: number,
    height: number,
    count: number
  ): void {
    for (let i = 0; i < count; i++) {
      const thornLength = 0.1 + this.random() * 0.15;
      const thornRadius = 0.02;

      // Create small cone for thorn
      const thornGeometry = new THREE.ConeGeometry(thornRadius, thornLength, 4);
      const thorn = new THREE.Mesh(thornGeometry, DesertMaterials.cactusGreen);

      // Random position around cylinder
      const angle = this.random() * Math.PI * 2;
      const y = (this.random() - 0.5) * height;
      const x = Math.cos(angle) * (radius + thornLength * 0.3);
      const z = Math.sin(angle) * (radius + thornLength * 0.3);

      thorn.position.set(x, y, z);

      // Point thorn outward
      thorn.lookAt(
        x + Math.cos(angle) * thornLength,
        y,
        z + Math.sin(angle) * thornLength
      );

      parent.add(thorn);
    }
  }

  private addBarrelThorns(parent: THREE.Mesh, radius: number): void {
    // Create ridged rows of thorns
    const ridges = 6;
    const thornsPerRidge = 8;

    for (let ridge = 0; ridge < ridges; ridge++) {
      const ridgeY = (ridge / (ridges - 1) - 0.5) * radius * 1.5;

      for (let i = 0; i < thornsPerRidge; i++) {
        const angle = (i / thornsPerRidge) * Math.PI * 2;
        const thornLength = 0.15 + this.random() * 0.1;

        const thornGeometry = new THREE.ConeGeometry(0.02, thornLength, 4);
        const thorn = new THREE.Mesh(
          thornGeometry,
          DesertMaterials.cactusGreen
        );

        const x = Math.cos(angle) * (radius + thornLength * 0.3);
        const z = Math.sin(angle) * (radius + thornLength * 0.3);

        thorn.position.set(x, ridgeY, z);
        thorn.lookAt(x + Math.cos(angle), ridgeY, z + Math.sin(angle));

        parent.add(thorn);
      }
    }
  }

  private addPaddleThorns(
    parent: THREE.Mesh,
    width: number,
    height: number
  ): void {
    const thornCount = 8 + Math.floor(this.random() * 8);

    for (let i = 0; i < thornCount; i++) {
      const thornLength = 0.08 + this.random() * 0.1;
      const thornGeometry = new THREE.ConeGeometry(0.015, thornLength, 4);
      const thorn = new THREE.Mesh(thornGeometry, DesertMaterials.cactusGreen);

      // Random position on paddle surface
      const x = (this.random() - 0.5) * width * 0.6;
      const y = (this.random() - 0.5) * height * 0.6;
      const z = (this.random() > 0.5 ? 1 : -1) * (0.2 + thornLength * 0.5);

      thorn.position.set(x, y, z);
      thorn.lookAt(x, y, z + (z > 0 ? thornLength : -thornLength));

      parent.add(thorn);
    }
  }

  getMesh(): THREE.Group {
    return this.mesh;
  }
}

class RockFormation {
  private mesh: THREE.Group;

  constructor(x: number, z: number, size: number = 1, random: () => number) {
    this.mesh = new THREE.Group();

    // Create multiple rocks
    const rockCount = 3 + Math.floor(random() * 3);
    for (let i = 0; i < rockCount; i++) {
      const rockSize = (0.5 + random() * 1.5) * size;
      const geometry = new THREE.DodecahedronGeometry(rockSize, 0);
      const material =
        random() > 0.5 ? DesertMaterials.rock : DesertMaterials.redRock;
      const rock = new THREE.Mesh(geometry, material);

      rock.position.set(
        (random() - 0.5) * 3 * size,
        rockSize * 0.5,
        (random() - 0.5) * 3 * size
      );
      rock.rotation.set(
        random() * Math.PI,
        random() * Math.PI,
        random() * Math.PI
      );
      rock.castShadow = true;
      this.mesh.add(rock);
    }

    this.mesh.position.set(x, 0, z);
  }

  getMesh(): THREE.Group {
    return this.mesh;
  }
}

class DesertPath extends JunglePath {
  constructor(scene: THREE.Scene) {
    super(scene);
    // Override path material to packed sand
    this.getSegments().forEach((segment) => {
      segment.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = DesertMaterials.packedSand;
        }
      });
    });
  }
}

class DesertMountains extends MountainRange {
  constructor(scene: THREE.Scene, minX: number, maxX: number, seed: number) {
    super(scene, minX, maxX, seed);

    // Override mountain colors to desert theme
    const colors = [0xcd853f, 0xd2691e, 0xbc8f8f]; // Desert mountain colors
    this.getMountains().forEach((mountain, index) => {
      mountain.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshPhongMaterial
        ) {
          const originalOpacity = child.material.opacity;
          child.material = new THREE.MeshPhongMaterial({
            color: colors[index % colors.length],
            transparent: true,
            opacity: originalOpacity,
          });
        }
      });
    });
  }
}

export class DesertEnvironment extends BaseEnvironment {
  private ground: THREE.Mesh;
  private path: DesertPath;
  private cacti: Cactus[] = [];
  private rocks: RockFormation[] = [];
  private mountains: DesertMountains;

  constructor(scene: THREE.Scene, seed: number = 12345) {
    super(scene, DesertConfig, seed);

    // Create sandy ground
    this.ground = this.createGround(DesertMaterials.sand);
    scene.add(this.ground);

    // Create desert path
    this.path = new DesertPath(scene);

    // Create cacti
    this.createCacti();

    // Create rock formations
    this.createRocks();

    // Create desert mountains
    this.mountains = new DesertMountains(scene, -120, 120, seed + 10000);
  }

  private createCacti(): void {
    const types: ("saguaro" | "barrel" | "prickly")[] = [
      "saguaro",
      "barrel",
      "prickly",
    ];

    // Place cacti along the desert
    for (let i = 0; i < 25; i++) {
      const x = (10 + this.random() * 20) * (this.random() > 0.5 ? 1 : -1);
      const z = -80 + i * 7 + this.random() * 5;
      const type = types[Math.floor(this.random() * types.length)];

      const cactus = new Cactus(x, z, type, this.random);
      this.cacti.push(cactus);
      this.scene.add(cactus.getMesh());
    }
  }

  private createRocks(): void {
    // Place rock formations
    for (let i = 0; i < 15; i++) {
      const x = (15 + this.random() * 25) * (this.random() > 0.5 ? 1 : -1);
      const z = -80 + i * 12 + this.random() * 8;
      const size = 0.8 + this.random() * 0.6;

      const rock = new RockFormation(x, z, size, this.random);
      this.rocks.push(rock);
      this.scene.add(rock.getMesh());
    }
  }

  updateByFrame(totalDistance: number): void {
    // Update ground position
    const groundCycleLength = 200;
    const groundPosition = -totalDistance % groundCycleLength;
    this.ground.position.z = groundPosition;

    // Update path
    this.path.updateByFrame(totalDistance);

    // Update cacti
    const cactusSpacing = 7;
    const totalCactusDistance = this.cacti.length * cactusSpacing;

    this.cacti.forEach((cactus, index) => {
      const baseZ = -80 + index * cactusSpacing;
      const newZ = baseZ - (totalDistance % totalCactusDistance);

      if (newZ < -100) {
        cactus.getMesh().position.z = newZ + totalCactusDistance;
      } else {
        cactus.getMesh().position.z = newZ;
      }
    });

    // Update rocks
    const rockSpacing = 12;
    const totalRockDistance = this.rocks.length * rockSpacing;

    this.rocks.forEach((rock, index) => {
      const baseZ = -80 + index * rockSpacing;
      const newZ = baseZ - (totalDistance % totalRockDistance);

      if (newZ < -100) {
        rock.getMesh().position.z = newZ + totalRockDistance;
      } else {
        rock.getMesh().position.z = newZ;
      }
    });

    // Update mountains
    this.mountains.updateByFrame(totalDistance);
  }

  getConfig(): EnvironmentConfig {
    return DesertConfig;
  }
}
