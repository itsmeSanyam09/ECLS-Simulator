import { useEffect, useRef, useState } from 'react'
import { socket } from '../Services/socket'
import { getSessions } from '../sessions/services/APIService';
import type { Session } from '../sessions/models/models';
import Canvascontainer from './components/Canvas'

const Trainee = () => {
  const [sessionsList, setSessionsList] = useState<Session[]>([]);
  const [showRoom, setShowRoom] = useState('')
  const [loading, setLoading] = useState(true)
  const [heart_rate, setHeart_rate] = useState('70')
  const [pIXELS_PER_MV, setPIXELS_PER_MV] = useState('100')
  const [heartRateRealTime, setHeartRateRealTime] = useState('70')
  const [pixelsPerMvRealTime, setPixelsPerMvRealTime] = useState('100')

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessions = await getSessions();
        setSessionsList(sessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };
    fetchSessions();
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });
    socket.on('recieve-values',({heartRate,pixelsPerMv})=>{
      console.log("recieve values")
      console.log(`values are ${heartRate} and ${pixelsPerMv} `)
      setHeart_rate(heartRate)
      setPIXELS_PER_MV(pixelsPerMv)
      setHeartRateRealTime(heartRate)
      setPixelsPerMvRealTime(pixelsPerMv)
      
    })
    setLoading(false)
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      if (socket.connected) {
        socket.disconnect();
      }
    };
  },[]);

  const handleJoinSession = (sessionId:string)=>{
    socket.emit('join-session',sessionId)
    setShowRoom('show')

  }

  const controllable_refs = {
    heartRate : useRef(null),
    pixelsPerMv : useRef(null),
    current_heart_rate : heartRateRealTime,
    currentPixelsPerMv : pixelsPerMvRealTime
  }



  




  // return (
  //   <>
  //   <h1 className='text-2xl text-center'>{currentRoom}</h1>
  //   {/* <button onClick={getRooms} className='text-lag bg-red-500 rounded-md p-3'>Get Rooms</button> */}
  //     {!currentRoom && <p>{JSON.stringify(something)}</p>}
  //     {!currentRoom && rooms.current.forEach(roomId => (
  //       <div key={roomId} className='container'>
  //         <span>{roomId}</span>
          
  //         <button className='bg-blue-600 p-3 rounded-md text-lg' onClick={() => joinRoom(roomId)}>Join</button>
  //       </div>
  //     ))}
  //     {!currentRoom && (<button className='text-lag bg-red-500 rounded-md p-3'>Hello{rooms.current}</button>)}
  //   {/* <div className='flex gap-2'>
  //     {currentRoom && (
  //       <>
  //       <div className="controls hidden rounded-md bg-white p-3">
  //           <div className="param-group">
  //               <label htmlFor="heart_rate">Heart Rate (bpm):</label>
  //               <input type="number" id="heart_rate" step="1" min="20" max="250" className='border-slate-600 border-2 rounded-md w-full' value={data.heartRate||70} ref={controllable_refs.heartRate}  />
  //           </div>
  //           <div className="param-group">
  //               <label htmlFor="pixelsPerMv">Pixels per mV:</label>
  //               <input type="number" id="pixelsPerMv" step="10" min="10" value={data.pixelsPerMv||100} ref={controllable_refs.PIXELS_PER_MV} />
  //           </div>
  //       </div>
  //       <div className="wave">
  //           <Canvascontainer controllable_refs={controllable_refs} />
  //       </div>
  //       </>

  //     )}

  //   </div> */}
  //   </>
  // )

  return(
    <>
    {!showRoom && (
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Session Name</th>
              <th className="px-4 py-3 font-semibold text-center w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center py-6 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : sessionsList.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-6 text-gray-400">
                  No Session found.
                </td>
              </tr>
            ) : (
              sessionsList.map((session, i) => (
                <tr
                  key={session.SessionId}
                  className={i % 2 === 0 ? "bg-white border-b-slate-200 border-[2px]" : "bg-gray-50 border-b-slate-200 border-[2px]"}
                >
                  <td className="px-4 py-3">{session.SessionName}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className="px-3 rounded bg-blue-700 text-white hover:bg-blue-800"
                      title="Join" onClick={()=>{handleJoinSession(session.SessionId)}}
                    >Join
                      <span className="sr-only">Join Session</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    )}
    {showRoom && (
      <div className="rounded-md bg-white p-5">
        <div className="flex justify-between">
          <p className='text-lg text-black'>Heart Rate: {heart_rate}</p>
          <p className='text-lg text-black'>Pixels Per Mv: {pIXELS_PER_MV}</p>
          <input className='border-[1px] rounded-md w-[8rem] px-2 py-1 hidden' placeholder='HeartRate' type="number" step="1" min="20" max="250" value={heart_rate} ref={controllable_refs.heartRate} />
          <input className='border-[1px] rounded-md px-2 py-1 hidden' placeholder='pixelsPerMv' type="number" id="pixelsPerMv" step="10" min="10" value={pIXELS_PER_MV} ref={controllable_refs.pixelsPerMv} />
        </div>
        <Canvascontainer controllable_refs={controllable_refs} />
      </div>
    )}

    </>
  )
}

export default Trainee
