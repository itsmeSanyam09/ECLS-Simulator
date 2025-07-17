export interface WaveParameter {
  id?: string;
  isDefault: boolean;
  ordinal?: number;
  pWaveHeight: number;
  pWaveBreadth: number;
  qWaveHeight: number;
  qWaveBreadth: number;
  rWaveHeight: number;
  rWaveBreadth: number;
  sWaveHeight: number;
  sWaveBreadth: number;
  tWaveHeight: number;
  tWaveBreadth: number;
  pqSegmentLength: number;
  stSegmentLength: number;
  tpSegmentLength: number;
}

export interface Wave {
  id?: string;
  name: string;
  heartRate: number;
  pixelsPerMv: number;
  defaultPWavesPerQrs: number;
  enableRWavePattern: boolean;
  rWavesInPattern?: number;
  applyRWaveAfterNQrs?: number;
  enablePWavePattern: boolean;
  pWavesInPattern?: number;
  applyPWaveAfterNQrs?: number;
  enableCustomBeatSequence: boolean;
  normalBeatsBeforeRepeat?: number;
  waveParameters: WaveParameter[];
}
