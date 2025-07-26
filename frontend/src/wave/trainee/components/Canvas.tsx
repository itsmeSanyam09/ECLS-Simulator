import { useEffect, useRef, useState } from 'react'
import type { Wave, WaveParameter } from '../../models/WaveModels';
import { boolean } from 'zod';

interface CanvasContainerProps {
  refs: WaveParameter;
  other_refs: Wave;
  fields: WaveParameter[];
}

const Canvascontainer: React.FC<CanvasContainerProps> = ({refs,other_refs,fields}) => {
  const svg = useRef<SVGSVGElement | null>(null);
  let animationFrameId: number;
  let lastTimestamp: number = 0;
  let pointerX : number = 0; 
  let firstSweep = true;

  const pathPoints =useRef([]);
  const drawnPoints = useRef<any[]>([]);
  const waveformPath = useRef<SVGPathElement | null>(null);
  const pointerHead = useRef<SVGCircleElement | null>(null);

  const PIXELS_PER_SECOND:number = 150;
  const POINTER_RADIUS:number = 6;
  const ERASE_WIDTH:number = 12;
  let customBeatsParameters = []
  const someBeats = useRef([]);


function mapWaveToBeat(wave: WaveParameter): beats {
  return {
    h_p: wave.pWaveHeight.toString(),
    b_p: wave.pWaveBreadth.toString(),
    h_q: wave.qWaveHeight.toString(),
    b_q: wave.qWaveBreadth.toString(),
    h_r: wave.rWaveHeight.toString(),
    b_r: wave.rWaveBreadth.toString(),
    h_s: wave.sWaveHeight.toString(),
    b_s: wave.sWaveBreadth.toString(),
    h_t: wave.tWaveHeight.toString(),
    b_t: wave.tWaveBreadth.toString(),
    l_pq: wave.pqSegmentLength.toString(),
    l_st: wave.stSegmentLength.toString(),
    l_tp: wave.tpSegmentLength.toString(),
  };
}

const beats_parameters = fields === undefined ? []:fields.map(mapWaveToBeat)

  
  const getParams = () =>({
    heart_rate: parseFloat(other_refs.heartRate),
    h_p: parseFloat(refs.pWaveHeight),
    b_p : parseFloat(refs.pWaveBreadth),
    h_q : parseFloat(refs.qWaveHeight),
    b_q : parseFloat(refs.qWaveBreadth),
    h_r : parseFloat(refs.rWaveHeight),
    b_r : parseFloat(refs.rWaveBreadth),
    h_s : parseFloat(refs.sWaveHeight),
    b_s : parseFloat(refs.sWaveBreadth),
    h_t : parseFloat(refs.tWaveHeight),
    b_t : parseFloat(refs.tWaveBreadth),
    l_pq : parseFloat(refs.pqSegmentLength),
    l_st : parseFloat(refs.stSegmentLength),
    l_tp : parseFloat(refs.tpSegmentLength),
    n_p : parseFloat(other_refs.defaultPWavesPerQrs),

  });

    let globalBeatCounter = 0;
    let globalCustomIdx = 0;
    let globalWaitingNormalBeats = 0;
    let globalRCycleCounter = 0;
    let globalPCycleCounter = 0;

  const raisedCosinePulse = (t:number, h:number, b:number, t0:number): number => {
    if (b === 0 || t < t0 || t > t0 + b) return 0;
    return (h / 2) * (1 - Math.cos((2 * Math.PI * (t - t0)) / b));
  };

  const [lines, setLines] = useState<JSX.Element[] | null>(null);

  function drawGridSVG() {
    const small = 8, large = small * 5;
    const newLines = [];
    for (let x = 0; x <= svg.current.width.baseVal.value; x += small) {
        newLines.push(
            <line 
              key={`w-${x}`}
              x1={x}
              y1={0}
              x2={x}
              y2={svg.current.height.baseVal.value}
              stroke="#eee"
            />
        )
    }

    for (let y = 0; y <= svg.current.height.baseVal.value; y += small) {
        newLines.push(
            <line 
              key={`h-${y}`}
              x1={0}
              y1={y}
              x2={svg.current.width.baseVal.value}
              y2={y}
              stroke="#eee"
            />


        )
    }
    setLines(newLines);
  }
  useEffect(()=>{
    drawGridSVG()
  },[])
  
 function generateWaveformPoints() {
  const pDefault = getParams();
  const totalTime = svg.current.width.baseVal.value / PIXELS_PER_SECOND;
  const y0 = svg.current.height.baseVal.value / 2;
  const pts = [];
  const dt = 1 / PIXELS_PER_SECOND;
  const rWaveEnabled = other_refs.enableRWavePattern;
  const rWaveCountInput = parseInt(other_refs.rWavesInPattern);
  const rWaveIntervalInput = parseInt(other_refs.applyRWaveAfterNQrs, 10);
  const pWaveEnabled = other_refs.pWavesInPattern
  const pWaveCountInput = parseInt(other_refs.pWavesInPattern, 10);
  const pWaveIntervalInput = parseInt(other_refs.applyPWaveAfterNQrs, 10);
  const useCustomBeatParametersInput = boolean(other_refs.enableCustomBeatSequence);
  const repeatIntervalInput = parseInt(other_refs.normalBeatsBeforeRepeat, 10);
  let rCycleCounterLocal = globalRCycleCounter;
  let pCycleCounterLocal = globalPCycleCounter;
  let beatCounter = globalBeatCounter;
  let customIdx = globalCustomIdx;
  let waitingNormalBeats = globalWaitingNormalBeats;
  let tElapsed = 0;
  while (tElapsed <= totalTime) {
      let pCurrent = pDefault;
      if (useCustomBeatParametersInput) {
          if (someBeats.current.length > 0 && waitingNormalBeats === 0) {
              pCurrent = { ...pDefault, ...someBeats.current[customIdx] };
              customIdx++;
              if (customIdx >= someBeats.current.length) {
                  customIdx = 0;
                  waitingNormalBeats = repeatIntervalInput;
              }
          } else if (waitingNormalBeats > 0) {
              waitingNormalBeats--;
          }
      }
      let curPCount = pCurrent.n_p;
      if (pWaveEnabled) {
          pCycleCounterLocal++;
          if (pWaveIntervalInput > 0 && pCycleCounterLocal >= pWaveIntervalInput) {
              curPCount = pWaveCountInput;
              pCycleCounterLocal = 0;
          }
      }
      let curRCount = 1;
      if (rWaveEnabled) {
          rCycleCounterLocal++;
          if (rWaveIntervalInput > 0 && rCycleCounterLocal >= rWaveIntervalInput) {
              curRCount = rWaveCountInput;
              rCycleCounterLocal = 0;
          }
      }
      const base = curPCount * (pCurrent.b_p + pCurrent.l_pq)
          + (pCurrent.b_q + pCurrent.b_r + pCurrent.b_s) * (curRCount > 0 ? 1 : 0)
          + pCurrent.l_st + pCurrent.b_t + pCurrent.l_tp;
      const heart_period = 60 / (pCurrent.heart_rate || 60);
      const sf = heart_period / base;
      const s = {
          b_p: pCurrent.b_p * sf, l_pq: pCurrent.l_pq * sf,
          b_q: pCurrent.b_q * sf, b_r: pCurrent.b_r * sf,
          b_s: pCurrent.b_s * sf, l_st: pCurrent.l_st * sf,
          b_t: pCurrent.b_t * sf, l_tp: pCurrent.l_tp * sf
      };
      const cycleDuration = curPCount * (s.b_p + s.l_pq)
          + (curRCount > 0 ? (s.b_q + s.b_r + s.b_s) : 0)
          + s.l_st + s.b_t + s.l_tp;
      const times = (() => {
          let off = tElapsed;
          const t: { P: number[]; Q: number; R: number[]; S: number[]; T: number } = { P: [], Q: 0, R: [], S: [], T: 0 };
          for (let i = 0; i < curPCount; i++) {
              t.P.push(off + i * (s.b_p + s.l_pq));
          }
          off += curPCount * (s.b_p + s.l_pq);
          if (curRCount > 0) {
              for (let i = 0; i < curRCount; i++) {
                  t.Q = off;
                  off += s.b_q;
                  t.R.push(off);
                  off += s.b_r;
                  t.S.push(off);
                  off += s.b_s;
                  if (i < curRCount - 1) off += s.l_pq / 2;
              }
          }
          off += s.l_st;
          t.T = off;
          return t;
      })();
      const tEnd = tElapsed + cycleDuration;
      for (let t = tElapsed; t < tEnd; t += dt) {
          let v = 0;
          for (const start of times.P) {
              if (t >= start && t < start + s.b_p) {
                  v = raisedCosinePulse(t, pCurrent.h_p, s.b_p, start);
                  break;
              }
          }
          if (!v && curRCount > 0 && t >= times.Q && t < times.Q + s.b_q) {
              v = raisedCosinePulse(t, pCurrent.h_q, s.b_q, times.Q);
          }
          if (!v && curRCount > 0) {
              for (const r of times.R) {
                  if (t >= r && t < r + s.b_r) {
                      v = raisedCosinePulse(t, pCurrent.h_r, s.b_r, r);
                      break;
                  }
              }
          }
          if (!v && curRCount > 0) {
              for (const sWave of times.S) {
                  if (t >= sWave && t < sWave + s.b_s) {
                      v = raisedCosinePulse(t, pCurrent.h_s, s.b_s, sWave);
                      break;
                  }
              }
          }
          if (!v && t >= times.T && t < times.T + s.b_t) {
              v = raisedCosinePulse(t, pCurrent.h_t, s.b_t, times.T);
          }
          pts.push({
              x: t * PIXELS_PER_SECOND,
              y: y0 - v * parseFloat(other_refs.pixelsPerMv)
          });
      }
      tElapsed += cycleDuration;
      beatCounter++;
  }
  // 🟢 Persist counters after generating this batch
  globalRCycleCounter = rCycleCounterLocal;
  globalPCycleCounter = pCycleCounterLocal;
  globalBeatCounter = beatCounter;
  globalCustomIdx = customIdx;
  globalWaitingNormalBeats = waitingNormalBeats;
  return pts;
  }

  const pointsToPath = pts =>
    pts.reduce((str, p, i) => str + (i ? " L" : "M") + ` ${p.x} ${p.y}`, "");
    
  function animationLoop(ts:number) {
    const w = svg.current.width.baseVal.value;
    const dt = lastTimestamp ? (ts - lastTimestamp) / 1000 : 0;
    lastTimestamp = ts;
    pointerX += PIXELS_PER_SECOND * dt;
    let idx =  pathPoints.current.findIndex(pt => pt.x >= pointerX);
    if (idx < 0) idx = pathPoints.current.length - 1;
    if (firstSweep) {
        drawnPoints.current = pathPoints.current.slice(0, idx + 1);
        waveformPath.current.setAttribute("d", pointsToPath(drawnPoints.current));
        if (pointerX > w){ 
            firstSweep = false;
            pathPoints.current = generateWaveformPoints();
        }
    } 
    else {
        if (pointerX > w) {
            pointerX = 0; // 🟢 Just resets the visual pointer
            pathPoints.current = generateWaveformPoints()
        }
        const es = pointerX - ERASE_WIDTH / 2, ee = pointerX + ERASE_WIDTH / 2;
        const si = drawnPoints.current.findIndex(pt => pt && pt.x >= es);
        const ei = drawnPoints.current.findIndex(pt => pt && pt.x > ee);
        for (let i = (si < 0 ? 0 : si); i < (ei < 0 ? drawnPoints.current.length : ei); i++) {
            drawnPoints.current[i] = pathPoints.current[i];
        }
        waveformPath.current.setAttribute("d", pointsToPath(drawnPoints.current));
    }
    const cur = pathPoints.current[idx];
    if (cur) {
        pointerHead.current.setAttribute("cx", cur.x);
        pointerHead.current.setAttribute("cy", cur.y);
    }

    animationFrameId = requestAnimationFrame(animationLoop);
  }


const applyNewParams = () => {
    customBeatsParameters = [];
    beats_parameters.forEach((obj,index) => {
        const beat = {}
        Object.entries(obj).forEach(([key,value]) => {
            beat[key] = parseFloat(value);

        })
        customBeatsParameters.push(beat)
    })
    someBeats.current = customBeatsParameters;


  globalRCycleCounter = 0;
  globalPCycleCounter = 0;
  globalBeatCounter = 0;
  globalCustomIdx = 0;
  globalWaitingNormalBeats = 0;


  pathPoints.current = generateWaveformPoints();
};
useEffect(()=>{
    
    
    drawnPoints.current = Array(pathPoints.current.length).fill(null);
    pathPoints.current = generateWaveformPoints();
    animationFrameId = requestAnimationFrame(animationLoop);
    applyNewParams()



},[])

// useEffect(()=>{
//     document.getElementById("applyBtn").addEventListener("click", applyNewParams);

    
// },[fields])





  return (
    <>
    <div className="canvas-container">
        <svg id="ecgSVG" width="1000" height="400" ref={svg}>
            <g>{lines}</g>
            <path stroke='#2c3e50' fill='none' strokeWidth={2} ref={waveformPath}  ></path>
            <circle r={POINTER_RADIUS} fill='#fff' stroke='#fff' ref={pointerHead} strokeWidth={2}  ></circle>

        </svg>
    </div>

    </>
  )
}

export default Canvascontainer