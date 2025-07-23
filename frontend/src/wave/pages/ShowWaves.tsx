import React, { useEffect, useRef, useState } from 'react';
import Controls from './components/Controls';
import Canvascontainer from './components/Canvascontainer';
import './showWaves.css';
import { createWave } from '../Services/ApiService';
// import type { Wave, WaveParameter } from "./models/WaveModels";

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

// interface WaveParameter {
//   id?: string;
//   isDefault: boolean;
//   ordinal?:number;
//   pWaveHeight: string;
//   pWaveBreadth: string;
//   qWaveHeight: string;
//   qWaveBreadth: string;
//   rWaveHeight: string;
//   rWaveBreadth: string;
//   sWaveHeight: string;
//   sWaveBreadth: string;
//   tWaveHeight: string;
//   tWaveBreadth: string;
//   pqSegmentLength: string;
//   stSegmentLength: string;
//   tpSegmentLength: string;
// }

// interface Wave {
//   id?: string;
//   name: string;
//   heartRate: any;
//   pixelsPerMv: any;
//   defaultPWavesPerQrs: any;
//   enableRWavePattern: any;
//   rWavesInPattern: any;
//   applyRWaveAfterNQrs: any;
//   enablePWavePattern: any;
//   pWavesInPattern: any;
//   applyPWaveAfterNQrs: any;
//   enableCustomBeatSequence: any;
//   normalBeatsBeforeRepeat: any;
//   waveParameters: WaveParameter[];
// }

const App: React.FC = () => {
  const refs: { [key: string]: React.RefObject<HTMLInputElement> } = {
    heart_rate: useRef(null),
    h_p: useRef(null),
    b_p: useRef(null),
    h_q: useRef(null),
    b_q: useRef(null),
    h_r: useRef(null),
    b_r: useRef(null),
    h_s: useRef(null),
    b_s: useRef(null),
    h_t: useRef(null),
    b_t: useRef(null),
    l_pq: useRef(null),
    l_st: useRef(null),
    l_tp: useRef(null),
    n_p: useRef(null),
  };

  const other_refs = {
    rWaveEnabled: useRef(null),
    rWaveCount: useRef(null),
    rWaveInterval: useRef(null),
    pWaveEnabled: useRef(null),
    pWaveInterval: useRef(null),
    pWaveCount: useRef(null),
    repeatInterval: useRef(null),
    useCustomBeatParameters: useRef(false),
    PIXELS_PER_MV: useRef(null),
  };

  const beat_config_refs = {
    beat_row: useRef(null),
    heart_rate: useRef(null),
    h_p: useRef(null),
    b_p: useRef(null),
    h_q: useRef(null),
    b_q: useRef(null),
    h_r: useRef(null),
    b_r: useRef(null),
    h_s: useRef(null),
    b_s: useRef(null),
    h_t: useRef(null),
    b_t: useRef(null),
    l_pq: useRef(null),
    l_st: useRef(null),
    l_tp: useRef(null),
    n_p: useRef(null),
    columns: useRef(null),
  };

  const [fields, setFields] = useState<WaveParameter[]>([]);

  const addField = () => {
    setFields([
      ...fields,
      {
        isDefault: false,
        pWaveHeight: '0.15',
        pWaveBreadth: '0.08',
        qWaveHeight: '-0.08',
        qWaveBreadth: '0.025',
        rWaveHeight: '1.2',
        rWaveBreadth: '0.05',
        sWaveHeight: '-0.25',
        sWaveBreadth: '0.025',
        tWaveHeight: '0.2',
        tWaveBreadth: '0.16',
        pqSegmentLength: '0.08',
        stSegmentLength: '0.12',
        tpSegmentLength: '0.3',
      },
    ]);
  };

  const updateField = (index: number, key: string, value: string) => {
    setFields((prevFields) => {
      const newFields = [...prevFields];
      newFields[index] = {
        ...newFields[index],
        [key]: value,
      };
      return newFields;
    });
  };

  const removeField = (indexToRemove: number) => {
    setFields((prevFields) =>
      prevFields.filter((_, idx) => idx !== indexToRemove)
    );
  };

  const applyChange = () => {
    const wave: Wave = {
      name: 'WaveNameHello',
      heartRate: parseFloat(refs.heart_rate.current?.value),
      pixelsPerMv: parseFloat(other_refs.PIXELS_PER_MV.current.value),
      defaultPWavesPerQrs: parseFloat(refs.n_p.current.value),
      enableRWavePattern: other_refs.rWaveEnabled.current.checked,
      rWavesInPattern: parseFloat(other_refs.rWaveCount.current.value),
      applyRWaveAfterNQrs: parseFloat(other_refs.rWaveInterval.current.value),
      enablePWavePattern: other_refs.pWaveEnabled.current.checked,
      pWavesInPattern: parseFloat(other_refs.pWaveCount.current.value),
      applyPWaveAfterNQrs: parseFloat(other_refs.pWaveInterval.current.value),
      enableCustomBeatSequence: other_refs.useCustomBeatParameters.current.checked,
      normalBeatsBeforeRepeat: parseFloat(other_refs.repeatInterval.current.value),
      waveParameters: [
        {
          isDefault: true,
          pWaveHeight: parseFloat(refs.h_p.current?.value),
          pWaveBreadth: parseFloat(refs.b_p.current?.value),
          qWaveHeight: parseFloat(refs.h_q.current?.value),
          qWaveBreadth: parseFloat(refs.b_q.current?.value),
          rWaveHeight: parseFloat(refs.h_r.current?.value),
          rWaveBreadth: parseFloat(refs.b_r.current?.value),
          sWaveHeight: parseFloat(refs.h_s.current?.value),
          sWaveBreadth: parseFloat(refs.b_s.current?.value),
          tWaveHeight: parseFloat(refs.h_t.current?.value),
          tWaveBreadth: parseFloat(refs.b_t.current?.value),
          pqSegmentLength: parseFloat(refs.l_pq.current?.value),
          stSegmentLength: parseFloat(refs.l_st.current?.value),
          tpSegmentLength: parseFloat(refs.l_tp.current?.value),
        } as WaveParameter,
        ...fields,
      ],
    };
    createWave(wave);
    console.log(wave)
  };

  return (
    <>
      <h1>ECG Waveform Animator (Custom Beats)</h1>
      <div className="container">
        <Controls
          refs={refs}
          other_refs={other_refs}
          beat_config_refs={beat_config_refs}
          fields={fields}
          addField={addField}
          updateField={updateField}
          removeField={removeField}
          applyChange={applyChange}
        />
        <Canvascontainer
          refs={refs}
          other_refs={other_refs}
          beat_config_refs={beat_config_refs}
          fields={fields}
        />
      </div>
    </>
  );
};

export default App;
