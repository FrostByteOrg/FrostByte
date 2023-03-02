import { useUser } from '@supabase/auth-helpers-react';
import useSocket from 'hooks/useSocket';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';

let socket;

export default function Channel() {
  useSocket();

  const [camera, setCamera] = useState(true);
  const [mic, setMic] = useState(true);

  const ICE_SERVERS = {
    iceServers: [
      {
        urls: 'stun:openrelay.metered.ca:80',
      },
    ],
  };

  const socketRef = useRef<Socket>();
  const router = useRouter();

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideoRef = useRef<HTMLVideoElement>(null);

  const rtcConnectionRef = useRef<RTCPeerConnection | null>(null);

  const userStreamRef = useRef<MediaStream>();

  const hostRef = useRef(false);

  const { id: room } = router.query;

  const user = useUser();

  // const socketConnect = async () => {
  //   await fetch('/api/socketio');

  //   socket = io();
  //   console.log(socket);

  //   socket.on('connect', () => {
  //     console.log('Connection established');
  //   });
  // };

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.emit('join-room', { room, user });
    socketRef.current.on('room-created', handleRoomCreated);
    socketRef.current.on('joined', handleRoomJoined);
    socketRef.current.on('ready', initiateCall);
    socketRef.current.on('leave', leaveRoom);
    socketRef.current.on('full', () => {
      window.location.href = '/';
    });
    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handlerIceCandidateMsg);

    return () => {
      socketRef.current!.disconnect();
    };
  }, [room]);

  const handleRoomCreated = async () => {
    hostRef.current = true;

    await navigator.mediaDevices
      .getUserMedia({
        audio: { echoCancellation: true },
        video: { width: 250, height: 250 },
      })
      .then((stream) => {
        userStreamRef.current = stream;
        userVideoRef.current!.srcObject = stream;
        userVideoRef.current!.onloadeddata = () => {
          userVideoRef.current!.play();
        };
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleRoomJoined = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: { width: 250, height: 250 },
      })
      .then((stream) => {
        userStreamRef.current = stream;
        userVideoRef.current!.srcObject = stream;
        userVideoRef.current!.onloadedmetadata = () => {
          userVideoRef.current!.play();
        };
        socketRef.current?.emit('ready', room);
      })
      .catch((err) => {
        console.log('error', err);
      });
  };

  const createPeerConnection = () => {
    const connection = new RTCPeerConnection(ICE_SERVERS);

    connection.onicecandidate = handleICECandidateEvent;

    connection.ontrack = handleTrackEvent;
    return connection;
  };

  const initiateCall = () => {
    if (hostRef.current) {
      rtcConnectionRef.current = createPeerConnection();
      rtcConnectionRef.current.addTrack(
        userStreamRef.current!.getTracks()[0],
        userStreamRef!.current!
      );
      rtcConnectionRef.current.addTrack(
        userStreamRef.current!.getTracks()[1],
        userStreamRef!.current!
      );
      rtcConnectionRef.current
        .createOffer()
        .then((offer: any) => {
          rtcConnectionRef!.current!.setLocalDescription(offer);
          socketRef!.current!.emit('offer', offer, room);
        })
        .catch((error: Error) => {
          console.log(error);
        });
    }
  };

  const handleOffer = (offer: any) => {
    if (!hostRef.current) {
      rtcConnectionRef.current = createPeerConnection();
      rtcConnectionRef.current.addTrack(
        userStreamRef.current!.getTracks()[0],
        userStreamRef.current!
      );
      rtcConnectionRef.current.addTrack(
        userStreamRef.current!.getTracks()[1],
        userStreamRef.current!
      );
      rtcConnectionRef.current.setRemoteDescription(offer);

      rtcConnectionRef.current
        .createAnswer()
        .then((answer) => {
          rtcConnectionRef.current!.setLocalDescription(answer);
          socketRef.current!.emit('answer', answer, room);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleAnswer = (answer: any) => {
    rtcConnectionRef
      .current!.setRemoteDescription(answer)
      .catch((err) => console.log(err));
  };

  const handleICECandidateEvent = (e: any) => {
    if (e.candidate) {
      socketRef.current!.emit('ice-candidate', e.candidate, room);
    }
  };

  const handlerIceCandidateMsg = (incoming: any) => {
    // We cast the incoming candidate to RTCIceCandidate
    const candidate = new RTCIceCandidate(incoming);
    rtcConnectionRef
      .current!.addIceCandidate(candidate)
      .catch((e) => console.log(e));
  };

  const handleTrackEvent = (event: any) => {
    peerVideoRef.current!.srcObject = event.streams[0];
  };

  const toggleMediaStream = (type: any, state: any) => {
    userStreamRef.current!.getTracks().forEach((track: any) => {
      if (track.kind === type) {
        track.enabled = !state;
      }
    });
  };

  const cameraControl = () => {
    toggleMediaStream('video', camera);
    setCamera((prev: any) => !prev);
  };

  const micControl = () => {
    toggleMediaStream('mic', mic);
    setMic((prev: any) => !prev);
  };

  const leaveRoom = () => {
    socketRef.current!.emit('leave', room);

    if (userVideoRef.current!.srcObject) {
      userStreamRef.current!.getTracks().forEach((track: any) => track.stop());
    }
    if (peerVideoRef.current!.srcObject) {
      userStreamRef.current!.getTracks().forEach((track: any) => track.stop()); 
    }

    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.ontrack = null;
      rtcConnectionRef.current.onicecandidate = null;
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }
    router.push('/');
  };
  return (
    <div>
      <video ref={userVideoRef} />
      <video ref={peerVideoRef} />
      <button onClick={micControl} type="button">
        {mic? 'Mute Mic' : 'UnMute Mic'}
      </button>
      <button onClick={leaveRoom} type="button">
        Leave
      </button>
      <button onClick={cameraControl} type="button">
        {camera ? 'Stop Camera' : 'Start Camera'}
      </button>
    </div>
  );
}
