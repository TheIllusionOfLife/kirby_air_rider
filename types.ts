export enum RacerType {
  KIRBY = 'Kirby',
  META_KNIGHT = 'Meta Knight',
  DEDEDE = 'King Dedede'
}

export interface Stats {
  topSpeed: number;
  acceleration: number;
  turnSpeed: number;
  weight: number; // Affects bumping
  chargeSpeed: number; // How fast boost charges
  color: string;
  secondaryColor: string;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface RacerState {
  id: string;
  type: RacerType;
  position: Vector2;
  velocity: Vector2;
  angle: number; // Radians
  currentSpeed: number;
  isDrifting: boolean;
  chargeLevel: number; // 0 to 100
  lap: number;
  nextCheckpointIndex: number;
  finished: boolean;
  finishTime: number;
  stats: Stats;
  rank: number;
  isPlayer: boolean;
}

export interface Checkpoint {
  position: Vector2;
  radius: number;
}

export enum GameStatus {
  MENU,
  RACING,
  FINISHED
}

export interface GameConfig {
  totalLaps: number;
  playerRacer: RacerType;
}