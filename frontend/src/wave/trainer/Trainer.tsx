import React, { useState,useRef, useEffect } from 'react'
import '../pages/showWaves.css'
import { socket } from '../Services/socket'
import Canvascontainer from '../trainee/components/Canvas'

const Trainer = () => {
    const [roomName, setRoomName] = useState('');
    const [sessionCreated, setSessionCreated] = useState<string>('')
    const [heartRate, setHeartRate] = useState('70')
    const [pixelsPerMv, setPixelsPerMv] = useState('100')
    const [sessionId, setSessionId] = useState('vsdvsd')
    const [roomEntered, setRoomEntered] = useState('')
    const [roomId, setroomId] = useState('')
    const [heartRateRealTime, setHeartRateRealTime] = useState('70')
    const [pixelsPerMvRealTime, setPixelsPerMvRealTime] = useState('100')

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });
    setroomId(String(Date.now()))

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      if (socket.connected) {
        socket.disconnect();
      }
    }; 
  }, []);

    const createRoom = () =>{
      socket.connect();
      socket.emit("session-create",{roomId,roomName},()=>{
        console.log(roomId)
      })
      setSessionCreated('created')


    }
    const handleJoin = () =>{
      

      socket.emit('join-session',roomId,()=>{
      })
      setRoomEntered('entered')

    }
    const handleUpdate = () =>{
      socket.emit('update-values',{roomId,heartRate,pixelsPerMv});
      setHeartRateRealTime(heartRate);
      setPixelsPerMvRealTime(pixelsPerMv);




    }
    const handleDelete = ()=>{
      socket.emit('delete-session',roomId,()=>{
        console.log("session deleetd in frontend")
      });
      setSessionCreated('')
      setRoomName('')

    }
    const controllable_refs = {
      heartRate: useRef(null),
      pixelsPerMv: useRef(null),
      current_heart_rate: heartRateRealTime,
      currentPixelsPerMv : pixelsPerMvRealTime
    }

  return(
    <div className='flex items-center justify-center'>
    <div className="">
    {!sessionCreated && (
      <div className='session-create flex flex-col gap-3 items-center justify-center'>
        <h1 className='text-slate-700 text-2xl'>Create Session</h1>
        <input className='bg-slate-400 rounded-md text-base text-gray-950 px-4 py-2' placeholder='Session name' type='text' value={roomName} onChange={(e)=>{setRoomName(e.target.value)}} />
        {/* <input className='bg-slate-400 rounded-md text-base text-gray-950 px-4 py-2' placeholder='Set Unique Id' type='text' value={roomId} onChange={(e)=>{setroomId(e.target.value)}} /> */}
        <button  onClick={createRoom} className='bg-blue-700 rounded-md px-4 py-2 w-fit text-white' >Create Session</button>
    </div>
      
    )}
    {sessionCreated && !roomEntered && (
      <div className='rounded-lg p-10 w-fit bg-white flex flex-col justify-center items-center gap-2'>
        <h2 className='text-xl'>Room: {roomName}</h2>
        <button className='bg-blue-700 text-white px-4 py-2 text-lg rounded-md' onClick={handleJoin}>Join</button>
      </div>
    )}
    {sessionCreated && roomEntered && (
      <div className="rounded-md p-10 bg-white relative">
        <button className='absolute top-3 right-3 bg-red-600 text-white text-base rounded-md px-4 py-2'onClick={handleDelete} >Delete Room</button>
        <div className='mb-4 flex gap-2'>
        <h2 className='text-center text-lg'>Room Name: {roomName}</h2>
        <input className='border-[1px] rounded-md w-[8rem] px-2 py-1' placeholder='HeartRate' type="number" step="1" min="20" max="250" value={heartRate} onChange={(e)=>{setHeartRate(e.target.value)}} />
        <input className='border-[1px] rounded-md px-2 py-1' placeholder='pixelsPerMv' type="number" id="pixelsPerMv" step="10" min="10" value={pixelsPerMv}  onChange={(e)=>{setPixelsPerMv(e.target.value)}} />
        <div className="hidden">
          <input className='border-[1px] rounded-md w-[8rem] px-2 py-1 hidden' placeholder='HeartRate' type="number" step="1" min="20" max="250" value={heartRateRealTime} ref={controllable_refs.heartRate} onChange={(e)=>{setHeartRateRealTime(e.target.value)}} />
          <input className='border-[1px] rounded-md px-2 py-1 hidden' placeholder='pixelsPerMv' type="number" id="pixelsPerMv" step="10" min="10" value={pixelsPerMvRealTime} ref={controllable_refs.pixelsPerMv} onChange={(e)=>{setPixelsPerMvRealTime(e.target.value)}} />
        </div>
        
        <button className='bg-blue-700 text-white px-3 py-2 rounded-md' onClick={handleUpdate}>Update</button>
        </div>
       
         <Canvascontainer controllable_refs={controllable_refs} />  
      </div>
      
    )}
    </div>
    </div>

  )

}

export default Trainer
