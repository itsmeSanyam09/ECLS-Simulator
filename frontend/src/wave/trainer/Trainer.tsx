
  import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getWave } from '../Services/ApiService'
import { useParams } from 'react-router-dom'
import type { Wave, WaveParameter } from '../models/WaveModels'
// import { string } from 'zod'
import Canvascontainer from './components/Canvas'

const Trainer = () => {

  const { id } = useParams<string>();
  const [dets, setDets] = useState<Wave | null>(null);

  useEffect (() => {
    if(id) {
      getWave(id).then((wave)=>{setDets(wave)})
    }

  }, [id])

  const refs:WaveParameter | undefined = dets?.waveParameters?.[0];
  const fields:WaveParameter[] = dets?.waveParameters?.slice(1);
  const other_refs:Wave = dets ? (({waveParameters, ...rest})=> rest)(dets)
  :null;
  const [heart_rate, setHeart_rate] = useState<number>(50)
  const [pixelsPerMv, setPixelsPerMv] = useState<number>(100)

  useEffect(() => {
    if(other_refs){
      setHeart_rate(other_refs.heartRate)
      setPixelsPerMv(other_refs.pixelsPerMv)


    }


  }, [dets])

  const controllable_refs = {
    heartRate : useRef(null),
    PIXELS_PER_MV : useRef(null)
  }

  return (
    <>
    <h1 className='text-2xl text-center'>{other_refs?.name}</h1>
    <div className='flex gap-2'>
        <div className="controls rounded-md bg-white p-3">
            <div className="param-group">
                <label htmlFor="heart_rate">Heart Rate (bpm):</label>
                { other_refs && <input type="number" id="heart_rate" step="1" min="20" max="250" className='border-slate-600 border-2 rounded-md w-full' value={heart_rate} ref={controllable_refs.heartRate} onChange={(e)=>{setHeart_rate(Number(e.target.value))}} />}
            </div>
            <div className="param-group">
                <label htmlFor="pixelsPerMv">Pixels per mV:</label>
                <input type="number" id="pixelsPerMv" step="10" min="10" value={pixelsPerMv} onChange={(e)=>{setPixelsPerMv(Number(e.target.value))}} ref={controllable_refs.PIXELS_PER_MV} />
            </div>
        </div>
        <div className="wave">
          {refs && other_refs && (
            <Canvascontainer other_refs={other_refs} refs={refs} fields={fields} controllable_refs={controllable_refs} />
          )}
        </div>
    </div>
    </>
  )
}

export default Trainer