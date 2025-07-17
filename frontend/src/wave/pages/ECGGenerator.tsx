import React, { useRef, useEffect, useState } from "react";
import { createWave, getWave, updateWave } from "../Services/ApiService";
import type { Wave, WaveParameter } from "../models/WaveModels";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

type BeatParams = {
  h_p: number;
  b_p: number;
  h_q: number;
  b_q: number;
  h_r: number;
  b_r: number;
  h_s: number;
  b_s: number;
  h_t: number;
  b_t: number;
  l_pq: number;
  l_st: number;
  l_tp: number;
};
type WaveParams = BeatParams & {
  heart_rate: number;
  pixelsPerMv: number;
  n_p: number;
  rWaveEnabled: boolean;
  rWaveCount: number;
  rWaveInterval: number;
  pWaveEnabled: boolean;
  pWaveCount: number;
  pWaveInterval: number;
  useCustomBeatParameters: boolean;
  repeatInterval: number;
};
const defaultParams: WaveParams = {
  heart_rate: 70,
  pixelsPerMv: 100,
  h_p: 0.15,
  b_p: 0.08,
  h_q: -0.1,
  b_q: 0.025,
  h_r: 1.2,
  b_r: 0.05,
  h_s: -0.25,
  b_s: 0.025,
  h_t: 0.2,
  b_t: 0.16,
  l_pq: 0.08,
  l_st: 0.12,
  l_tp: 0.3,
  n_p: 1,
  rWaveEnabled: false,
  rWaveCount: 2,
  rWaveInterval: 5,
  pWaveEnabled: false,
  pWaveCount: 0,
  pWaveInterval: 3,
  useCustomBeatParameters: false,
  repeatInterval: 10,
};
const defaultCustomBeat: BeatParams = {
  h_p: 0.15,
  b_p: 0.08,
  h_q: -0.1,
  b_q: 0.025,
  h_r: 1.2,
  b_r: 0.05,
  h_s: -0.25,
  b_s: 0.025,
  h_t: 0.2,
  b_t: 0.16,
  l_pq: 0.08,
  l_st: 0.12,
  l_tp: 0.3,
};
const fields: Array<{ key: keyof BeatParams; label: string; step: number }> = [
  { key: "h_p", label: "P Height", step: 0.01 },
  { key: "b_p", label: "P Breadth", step: 0.01 },
  { key: "h_q", label: "Q Height", step: 0.01 },
  { key: "b_q", label: "Q Breadth", step: 0.005 },
  { key: "h_r", label: "R Height", step: 0.1 },
  { key: "b_r", label: "R Breadth", step: 0.01 },
  { key: "h_s", label: "S Height", step: 0.01 },
  { key: "b_s", label: "S Breadth", step: 0.005 },
  { key: "h_t", label: "T Height", step: 0.01 },
  { key: "b_t", label: "T Breadth", step: 0.01 },
  { key: "l_pq", label: "PQ Length", step: 0.01 },
  { key: "l_st", label: "ST Length", step: 0.01 },
  { key: "l_tp", label: "TP Length", step: 0.01 },
];
const WIDTH = 1000,
  HEIGHT = 400,
  POINTER_RADIUS = 6,
  ERASE_WIDTH = 12,
  PIXELS_PER_SECOND = 150;

function uid() {
  return Math.random().toString(36).substr(2, 9);
}
const clone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const ECGGenerator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [waveVersion, setWaveVersion] = useState(0);

  // Mutable Refs (no state, no rerender!)
  const paramsRef = useRef<WaveParams>(clone(defaultParams));
  const customBeatsRef = useRef<(BeatParams & { _id: string })[]>([]);
  const inputsRef = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const svgPathRef = useRef<SVGPathElement>(null);
  const svgPointerRef = useRef<SVGCircleElement>(null);

  // Animation loop state
  const pointerXRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const firstSweepRef = useRef<boolean>(true);
  const frameRef = useRef<number>();
  const pathPointsRef = useRef<{ x: number; y: number }[]>([]);
  const drawnPointsRef = useRef<{ x: number; y: number }[]>([]);

  let globalBeatCounter = 0;
  let globalCustomIdx = 0;
  let globalWaitingNormalBeats = 0;
  let globalRCycleCounter = 0;
  let globalPCycleCounter = 0;

  const pts = useRef(generateWaveformPoints());
  const patternNameRef = useRef<HTMLInputElement>(null);
  const waveIdRef = useRef<string | null>(null); // Track editing wave id

  // --- Load for Edit ---
  useEffect(() => {
    if (!id) return;
    setEditMode(true);
    getWave(id).then((wave) => {
      // Pattern Name
      if (patternNameRef.current) patternNameRef.current.value = wave.name;

      // Params
      const d = wave.waveParameters.find((p) => p.isDefault)!;
      paramsRef.current = {
        heart_rate: wave.heartRate,
        pixelsPerMv: wave.pixelsPerMv,
        h_p: d.pWaveHeight,
        b_p: d.pWaveBreadth,
        h_q: d.qWaveHeight,
        b_q: d.qWaveBreadth,
        h_r: d.rWaveHeight,
        b_r: d.rWaveBreadth,
        h_s: d.sWaveHeight,
        b_s: d.sWaveBreadth,
        h_t: d.tWaveHeight,
        b_t: d.tWaveBreadth,
        l_pq: d.pqSegmentLength,
        l_st: d.stSegmentLength,
        l_tp: d.tpSegmentLength,
        n_p: wave.defaultPWavesPerQrs,
        rWaveEnabled: wave.enableRWavePattern,
        rWaveCount: wave.rWavesInPattern ?? 2,
        rWaveInterval: wave.applyRWaveAfterNQrs ?? 5,
        pWaveEnabled: wave.enablePWavePattern,
        pWaveCount: wave.pWavesInPattern ?? 0,
        pWaveInterval: wave.applyPWaveAfterNQrs ?? 3,
        useCustomBeatParameters: wave.enableCustomBeatSequence,
        repeatInterval: wave.normalBeatsBeforeRepeat ?? 10,
      };

      // Custom Beats
      customBeatsRef.current = wave.waveParameters
        .filter((p) => !p.isDefault)
        .map((p) => ({
          h_p: p.pWaveHeight,
          b_p: p.pWaveBreadth,
          h_q: p.qWaveHeight,
          b_q: p.qWaveBreadth,
          h_r: p.rWaveHeight,
          b_r: p.rWaveBreadth,
          h_s: p.sWaveHeight,
          b_s: p.sWaveBreadth,
          h_t: p.tWaveHeight,
          b_t: p.tWaveBreadth,
          l_pq: p.pqSegmentLength,
          l_st: p.stSegmentLength,
          l_tp: p.tpSegmentLength,
          _id: uid(),
        }));

      waveIdRef.current = wave.id || null;
      setWaveVersion((v) => v + 1); // restart animation
      forceFormUIUpdate();

      // --- Set input values for all fields after DOM updates (delay required!) ---
      setTimeout(() => {
        // Top-level params
        Object.entries(paramsRef.current).forEach(([key, val]) => {
          if (inputsRef.current[key]) {
            if (typeof val === "boolean") {
              (inputsRef.current[key] as HTMLInputElement).checked = val;
            } else {
              (inputsRef.current[key] as HTMLInputElement).value = String(val);
            }
          }
        });

        // Pattern name (already set, but for completeness)
        if (patternNameRef.current) {
          patternNameRef.current.value = wave.name;
        }
      }, 50);
    });
  }, [id]);

  // ---- Input handlers ----
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, type, value, checked } = e.target;
    let next = paramsRef.current;
    next = { ...next, [id]: type === "checkbox" ? checked : Number(value) };
    paramsRef.current = next;
    // For checkboxes, keep UI checked state
    if (type === "checkbox" && inputsRef.current[id]) {
      inputsRef.current[id]!.checked = checked;
    }
    // No setState, just update the ref!
  };
  const handleCustomBeatInput = (
    beatId: string,
    key: keyof BeatParams,
    value: number
  ) => {
    customBeatsRef.current = customBeatsRef.current.map((b) =>
      b._id === beatId ? { ...b, [key]: value } : b
    );
  };

  const addCustomBeat = () => {
    customBeatsRef.current.push({ ...defaultCustomBeat, _id: uid() });
    forceFormUIUpdate();
  };

  const removeCustomBeat = (id: string) => {
    customBeatsRef.current = customBeatsRef.current.filter((b) => b._id !== id);
    forceFormUIUpdate();
  };

  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  function forceFormUIUpdate() {
    forceUpdate();
  }

  function raisedCosinePulse(t: number, h: number, b: number, t0: number) {
    if (b === 0 || t < t0 || t > t0 + b) return 0;
    return (h / 2) * (1 - Math.cos((2 * Math.PI * (t - t0)) / b));
  }
  function generateWaveformPoints(): { x: number; y: number }[] {
    const pDefault = paramsRef.current;
    const customBeatsArr = customBeatsRef.current;
    const y0 = HEIGHT / 2;
    const pts: { x: number; y: number }[] = [];
    const totalTime = WIDTH / PIXELS_PER_SECOND,
      dt = 1 / PIXELS_PER_SECOND;
    const useCustomBeatParametersInput = pDefault.useCustomBeatParameters;
    const repeatIntervalInput = pDefault.repeatInterval;
    let rWaveEnabled = pDefault.rWaveEnabled;
    let rWaveCountInput = pDefault.rWaveCount;
    let rWaveIntervalInput = pDefault.rWaveInterval;
    let pWaveEnabled = pDefault.pWaveEnabled;
    let pWaveCountInput = pDefault.pWaveCount;
    let pWaveIntervalInput = pDefault.pWaveInterval;
    let rCycleCounterLocal = globalRCycleCounter;
    let pCycleCounterLocal = globalPCycleCounter;
    let beatCounter = globalBeatCounter;
    let customIdx = globalCustomIdx;
    let waitingNormalBeats = globalWaitingNormalBeats;
    let tElapsed = 0;

    while (tElapsed <= totalTime) {
      let pCurrent = pDefault;
      if (useCustomBeatParametersInput) {
        if (customBeatsArr.length > 0 && waitingNormalBeats === 0) {
          pCurrent = { ...pDefault, ...customBeatsArr[customIdx] };
          customIdx++;
          if (customIdx >= customBeatsArr.length) {
            customIdx = 0;
            waitingNormalBeats = repeatIntervalInput;
          }
        } else if (waitingNormalBeats > 0) waitingNormalBeats--;
      }
      let curPCount = pCurrent.n_p;
      if (pWaveEnabled) {
        pCycleCounterLocal++;
        if (
          pWaveIntervalInput > 0 &&
          pCycleCounterLocal >= pWaveIntervalInput
        ) {
          curPCount = pWaveCountInput;
          pCycleCounterLocal = 0;
        }
      }
      let curRCount = 1;
      if (rWaveEnabled) {
        rCycleCounterLocal++;
        if (
          rWaveIntervalInput > 0 &&
          rCycleCounterLocal >= rWaveIntervalInput
        ) {
          curRCount = rWaveCountInput;
          rCycleCounterLocal = 0;
        }
      }
      const base =
        curPCount * (pCurrent.b_p + pCurrent.l_pq) +
        (pCurrent.b_q + pCurrent.b_r + pCurrent.b_s) * (curRCount > 0 ? 1 : 0) +
        pCurrent.l_st +
        pCurrent.b_t +
        pCurrent.l_tp;
      const heart_period = 60 / (pCurrent.heart_rate || 60),
        sf = heart_period / base;
      const s = {
        b_p: pCurrent.b_p * sf,
        l_pq: pCurrent.l_pq * sf,
        b_q: pCurrent.b_q * sf,
        b_r: pCurrent.b_r * sf,
        b_s: pCurrent.b_s * sf,
        l_st: pCurrent.l_st * sf,
        b_t: pCurrent.b_t * sf,
        l_tp: pCurrent.l_tp * sf,
      };
      const cycleDuration =
        curPCount * (s.b_p + s.l_pq) +
        (curRCount > 0 ? s.b_q + s.b_r + s.b_s : 0) +
        s.l_st +
        s.b_t +
        s.l_tp;
      const times = (() => {
        let off = tElapsed;
        const t = {
          P: [] as number[],
          Q: 0,
          R: [] as number[],
          S: [] as number[],
          T: 0,
        };
        for (let i = 0; i < curPCount; i++)
          t.P.push(off + i * (s.b_p + s.l_pq));
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
        for (let start of times.P) {
          if (t >= start && t < start + s.b_p) {
            v = raisedCosinePulse(t, pCurrent.h_p, s.b_p, start);
            break;
          }
        }
        if (!v && curRCount > 0 && t >= times.Q && t < times.Q + s.b_q)
          v = raisedCosinePulse(t, pCurrent.h_q, s.b_q, times.Q);
        if (!v && curRCount > 0) {
          for (let r of times.R) {
            if (t >= r && t < r + s.b_r) {
              v = raisedCosinePulse(t, pCurrent.h_r, s.b_r, r);
              break;
            }
          }
        }
        if (!v && curRCount > 0) {
          for (let sWave of times.S) {
            if (t >= sWave && t < sWave + s.b_s) {
              v = raisedCosinePulse(t, pCurrent.h_s, s.b_s, sWave);
              break;
            }
          }
        }
        if (!v && t >= times.T && t < times.T + s.b_t)
          v = raisedCosinePulse(t, pCurrent.h_t, s.b_t, times.T);
        pts.push({
          x: t * PIXELS_PER_SECOND,
          y: y0 - v * pDefault.pixelsPerMv,
        });
      }
      tElapsed += cycleDuration;
      beatCounter++;
    }

    globalRCycleCounter = rCycleCounterLocal;
    globalPCycleCounter = pCycleCounterLocal;
    globalBeatCounter = beatCounter;
    globalCustomIdx = customIdx;
    globalWaitingNormalBeats = waitingNormalBeats;
    return pts;
  }
  function pointsToPath(pts: { x: number; y: number }[]) {
    return pts.reduce(
      (str, p, i) => str + (i ? " L" : "M") + ` ${p.x} ${p.y}`,
      ""
    );
  }

  // --- Animation Effect: restart when waveVersion changes ---
  useEffect(() => {
    pointerXRef.current = 0;
    lastTimeRef.current = 0;
    firstSweepRef.current = true;
    pts.current = generateWaveformPoints();

    let animFrameId: number;
    function animate(ts: number) {
      const w = WIDTH;
      const dt = lastTimeRef.current ? (ts - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = ts;
      pointerXRef.current += PIXELS_PER_SECOND * dt;
      pathPointsRef.current = pts.current;
      let idx = pts.current.findIndex((pt) => pt.x >= pointerXRef.current);
      if (idx < 0) idx = pts.current.length - 1;
      if (firstSweepRef.current) {
        drawnPointsRef.current = pts.current.slice(0, idx + 1);
        if (svgPathRef.current)
          svgPathRef.current.setAttribute(
            "d",
            pointsToPath(drawnPointsRef.current)
          );
        if (pointerXRef.current > w) firstSweepRef.current = false;
      } else {
        if (pointerXRef.current > w) {
          pointerXRef.current = 0;
          pts.current = generateWaveformPoints();
        }
        const es = pointerXRef.current - ERASE_WIDTH / 2,
          ee = pointerXRef.current + ERASE_WIDTH / 2;
        const si = drawnPointsRef.current.findIndex((pt) => pt && pt.x >= es);
        const ei = drawnPointsRef.current.findIndex((pt) => pt && pt.x > ee);
        for (
          let i = si < 0 ? 0 : si;
          i < (ei < 0 ? drawnPointsRef.current.length : ei);
          i++
        ) {
          drawnPointsRef.current[i] = pts.current[i];
        }
        if (svgPathRef.current)
          svgPathRef.current.setAttribute(
            "d",
            pointsToPath(drawnPointsRef.current)
          );
      }
      // Move pointer
      const cur = pts.current[idx];
      if (cur && svgPointerRef.current) {
        svgPointerRef.current.setAttribute("cx", String(cur.x));
        svgPointerRef.current.setAttribute("cy", String(cur.y));
      }
      animFrameId = requestAnimationFrame(animate);
    }
    animFrameId = requestAnimationFrame(animate);
    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
    // eslint-disable-next-line
  }, [waveVersion]);

  // -- SVG grid lines (static) --
  const gridLines: JSX.Element[] = [];
  for (let x = 0; x <= WIDTH; x += 8) {
    gridLines.push(
      <line key={`x${x}`} x1={x} y1={0} x2={x} y2={HEIGHT} stroke="#eee" />
    );
  }
  for (let y = 0; y <= HEIGHT; y += 8) {
    gridLines.push(
      <line key={`y${y}`} x1={0} y1={y} x2={WIDTH} y2={y} stroke="#eee" />
    );
  }

  return (
    <div className="flex flex-wrap gap-8 p-8 bg-gray-100 min-h-screen">
      <form
        className="flex-1 min-w-[320px] max-w-[410px] bg-white p-6 rounded-xl shadow-lg overflow-y-auto max-h-[95vh]"
        onSubmit={(e) => {
          e.preventDefault(); /* no-op */
        }}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          ECG Waveform Animator (Custom Beats)
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <label htmlFor="patternName" className="flex-1 text-gray-700">
              Pattern Name:
            </label>
            <input
              id="patternName"
              ref={patternNameRef}
              type="text"
              className="border px-2 py-1 rounded w-full"
              placeholder="Enter pattern name"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="heart_rate" className="flex-1 text-gray-700">
              Heart Rate (bpm):
            </label>
            <input
              ref={(el) => (inputsRef.current["heart_rate"] = el)}
              id="heart_rate"
              type="number"
              defaultValue={defaultParams.heart_rate}
              onChange={handleInput}
              step={1}
              min={20}
              max={250}
              className="border px-2 py-1 rounded w-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="pixelsPerMv" className="flex-1 text-gray-700">
              Pixels per mV:
            </label>
            <input
              ref={(el) => (inputsRef.current["pixelsPerMv"] = el)}
              id="pixelsPerMv"
              type="number"
              defaultValue={defaultParams.pixelsPerMv}
              onChange={handleInput}
              step={10}
              min={10}
              className="border px-2 py-1 rounded w-24"
            />
          </div>
          <hr className="my-2" />
          <h3 className="font-semibold text-gray-600">
            Wave Parameters (mV, sec)
          </h3>
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-2">
              <label htmlFor={f.key} className="flex-1 text-gray-700">
                {f.label}:
              </label>
              <input
                ref={(el) => (inputsRef.current[f.key] = el)}
                id={f.key}
                type="number"
                defaultValue={defaultParams[f.key]}
                onChange={handleInput}
                step={f.step}
                className="border px-2 py-1 rounded w-24"
              />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <label htmlFor="n_p" className="flex-1 text-gray-700">
              Default P Waves per QRS:
            </label>
            <input
              ref={(el) => (inputsRef.current["n_p"] = el)}
              id="n_p"
              type="number"
              defaultValue={defaultParams.n_p}
              onChange={handleInput}
              step={1}
              min={1}
              className="border px-2 py-1 rounded w-24"
            />
          </div>
        </div>

        <hr className="my-2" />
        <h3 className="font-semibold text-gray-600">Dynamic R Wave Pattern</h3>
        <div className="flex items-center gap-2">
          <input
            ref={(el) => (inputsRef.current["rWaveEnabled"] = el)}
            id="rWaveEnabled"
            type="checkbox"
            defaultChecked={defaultParams.rWaveEnabled}
            onChange={handleInput}
            className="accent-blue-500"
          />
          <label htmlFor="rWaveEnabled" className="flex-1 text-gray-700">
            Enable R Wave Pattern
          </label>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="rWaveCount" className="flex-1 text-gray-700">
            R Waves in Pattern:
          </label>
          <input
            ref={(el) => (inputsRef.current["rWaveCount"] = el)}
            id="rWaveCount"
            type="number"
            defaultValue={defaultParams.rWaveCount}
            onChange={handleInput}
            step={1}
            min={0}
            className="border px-2 py-1 rounded w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="rWaveInterval" className="flex-1 text-gray-700">
            Apply After N QRS:
          </label>
          <input
            ref={(el) => (inputsRef.current["rWaveInterval"] = el)}
            id="rWaveInterval"
            type="number"
            defaultValue={defaultParams.rWaveInterval}
            onChange={handleInput}
            step={1}
            min={0}
            className="border px-2 py-1 rounded w-24"
          />
        </div>

        <hr className="my-2" />
        <h3 className="font-semibold text-gray-600">Dynamic P Wave Pattern</h3>
        <div className="flex items-center gap-2">
          <input
            ref={(el) => (inputsRef.current["pWaveEnabled"] = el)}
            id="pWaveEnabled"
            type="checkbox"
            defaultChecked={defaultParams.pWaveEnabled}
            onChange={handleInput}
            className="accent-blue-500"
          />
          <label htmlFor="pWaveEnabled" className="flex-1 text-gray-700">
            Enable P Wave Pattern
          </label>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="pWaveCount" className="flex-1 text-gray-700">
            P Waves in Pattern:
          </label>
          <input
            ref={(el) => (inputsRef.current["pWaveCount"] = el)}
            id="pWaveCount"
            type="number"
            defaultValue={defaultParams.pWaveCount}
            onChange={handleInput}
            step={1}
            min={0}
            className="border px-2 py-1 rounded w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="pWaveInterval" className="flex-1 text-gray-700">
            Apply After N QRS:
          </label>
          <input
            ref={(el) => (inputsRef.current["pWaveInterval"] = el)}
            id="pWaveInterval"
            type="number"
            defaultValue={defaultParams.pWaveInterval}
            onChange={handleInput}
            step={1}
            min={0}
            className="border px-2 py-1 rounded w-24"
          />
        </div>

        <hr className="my-2" />
        <h3 className="font-semibold text-gray-600">Custom Beat Sequence</h3>
        <div className="flex items-center gap-2">
          <input
            ref={(el) => (inputsRef.current["useCustomBeatParameters"] = el)}
            id="useCustomBeatParameters"
            type="checkbox"
            defaultChecked={defaultParams.useCustomBeatParameters}
            onChange={handleInput}
            className="accent-blue-500"
          />
          <label
            htmlFor="useCustomBeatParameters"
            className="flex-1 text-gray-700"
          >
            Enable Custom Beat Sequence
          </label>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="repeatInterval" className="flex-1 text-gray-700">
            Normal Beats Before Repeat:
          </label>
          <input
            ref={(el) => (inputsRef.current["repeatInterval"] = el)}
            id="repeatInterval"
            type="number"
            defaultValue={defaultParams.repeatInterval}
            onChange={handleInput}
            step={1}
            min={0}
            className="border px-2 py-1 rounded w-24"
          />
        </div>
        <div className="mt-2">
          {customBeatsRef.current.map((beat, idx) => (
            <div key={beat._id} className="border p-2 rounded mb-2 bg-gray-50">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-gray-600">
                  Custom Beat #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCustomBeat(beat._id)}
                  className="bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-700"
                >
                  Remove Beat
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {fields.map((f) => (
                  <div key={f.key} className="flex items-center gap-1">
                    <label className="flex-1 text-xs text-gray-600">
                      {f.label}:
                    </label>
                    <input
                      type="number"
                      defaultValue={beat[f.key]}
                      step={f.step}
                      onChange={(e) =>
                        handleCustomBeatInput(
                          beat._id,
                          f.key,
                          parseFloat(e.target.value)
                        )
                      }
                      className="border px-1 py-0.5 rounded w-16 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addCustomBeat}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded mt-2 transition-all"
          >
            + Add Custom Beat
          </button>
        </div>
        <button
          type="button"
          onClick={forceFormUIUpdate}
          className="hidden w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded mt-4 transition-all"
        >
          Apply Changes
        </button>
        <button
          type="button"
          onClick={async () => {
            const name = patternNameRef.current?.value?.trim() || "";
            if (!name) {
              alert("Please enter a pattern name.");
              patternNameRef.current?.focus();
              return;
            }
            const p = paramsRef.current;
            const customBeats = customBeatsRef.current;
            // Compose Wave object as before...
            const baseParam: WaveParameter = {
              isDefault: true,
              ordinal: 0,
              pWaveHeight: p.h_p,
              pWaveBreadth: p.b_p,
              qWaveHeight: p.h_q,
              qWaveBreadth: p.b_q,
              rWaveHeight: p.h_r,
              rWaveBreadth: p.b_r,
              sWaveHeight: p.h_s,
              sWaveBreadth: p.b_s,
              tWaveHeight: p.h_t,
              tWaveBreadth: p.b_t,
              pqSegmentLength: p.l_pq,
              stSegmentLength: p.l_st,
              tpSegmentLength: p.l_tp,
            };
            const customParams: WaveParameter[] = customBeats.map((b, i) => ({
              isDefault: false,
              ordinal: i + 1,
              pWaveHeight: b.h_p,
              pWaveBreadth: b.b_p,
              qWaveHeight: b.h_q,
              qWaveBreadth: b.b_q,
              rWaveHeight: b.h_r,
              rWaveBreadth: b.b_r,
              sWaveHeight: b.h_s,
              sWaveBreadth: b.b_s,
              tWaveHeight: b.h_t,
              tWaveBreadth: b.b_t,
              pqSegmentLength: b.l_pq,
              stSegmentLength: b.l_st,
              tpSegmentLength: b.l_tp,
            }));

            const wave: Omit<Wave, "id"> = {
              name,
              heartRate: p.heart_rate,
              pixelsPerMv: p.pixelsPerMv,
              defaultPWavesPerQrs: p.n_p,
              enableRWavePattern: p.rWaveEnabled,
              rWavesInPattern: p.rWaveCount,
              applyRWaveAfterNQrs: p.rWaveInterval,
              enablePWavePattern: p.pWaveEnabled,
              pWavesInPattern: p.pWaveCount,
              applyPWaveAfterNQrs: p.pWaveInterval,
              enableCustomBeatSequence: p.useCustomBeatParameters,
              normalBeatsBeforeRepeat: p.repeatInterval,
              waveParameters: [baseParam, ...customParams],
            };
            try {
              if (editMode && waveIdRef.current) {
                console.log(wave)
                await updateWave(waveIdRef.current, wave);
                toast.success("Pattern updated!");
                alert("Pattern updated!");
              } else {
                await createWave(wave);
                alert("Pattern saved!");
              }
              // navigate("/");
            } catch (err: any) {
              alert("Failed to save pattern: " + (err?.message || err));
            }
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded mt-2 transition-all"
        >
          {editMode ? "Update Pattern" : "Save Pattern"}
        </button>
      </form>
      <div className="flex-2 min-w-[600px] flex justify-center items-center">
        <svg
          width={WIDTH}
          height={HEIGHT}
          className="border bg-white rounded-xl shadow"
          id="ecgSVG"
        >
          <g>{gridLines}</g>
          <path ref={svgPathRef} stroke="#2c3e50" fill="none" strokeWidth={2} />
          <circle
            ref={svgPointerRef}
            r={POINTER_RADIUS}
            fill="#fff"
            stroke="#fff"
            strokeWidth={2}
          />
        </svg>
      </div>
    </div>
  );
};

export default ECGGenerator;
