import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import useSocket from '../../hooks/useSocket';

const ICE_SERVERS = {
  iceServers: [
    {
      urls: 'stun:openrealy.metered.ca:80',
    },
  ],
};
let socket;

export default function Channel() {
  useSocket();

  const [camera, setCamera] = useState(true);
  const [mic, setMic] = useState(true);

  const router = useRouter();

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideoRef = useRef<HTMLVideoElement>(null);

  const rtcConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket>();
  const userStreamRef = useRef<MediaStream>();
  const hostRef = useRef(false);

  const { id: channelId } = router.query;

  useEffect(() => {
    console.log('hello world');
    socketRef.current = io();

    socketRef.current.emit('join', channelId);

    socketRef.current.on('created', handleRoomCreated);

    socketRef.current.on('joined', handleRoomJoined);

    socketRef.current.on('ready', initateCall);

    socketRef.current.on('leave', leaveRoom);

    socketRef.current.on('connection-offer', handleReceivedOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice', handleNewIceCandidateMsg);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [channelId]);

  const handleRoomCreated = async () => {
    hostRef.current = true;
    await navigator.mediaDevices
      .getUserMedia({
        audio: true,
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
        socketRef.current?.emit('ready', channelId);
      })
      .catch((err) => {
        console.log('error', err);
      });
  };

  const initateCall = () => {
    if (hostRef.current) {
      rtcConnectionRef.current = createPeerConnection();
      rtcConnectionRef.current.addTrack(
        userStreamRef!.current!.getTracks()[0],
        userStreamRef!.current!
      );
      rtcConnectionRef.current.addTrack(
        userStreamRef!.current!.getTracks()[1],
        userStreamRef.current!
      );
      rtcConnectionRef.current
        .createOffer()
        .then((offer: any) => {
          rtcConnectionRef.current!.setLocalDescription(offer);
          socketRef.current!.emit('offer', offer, channelId);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const createPeerConnection = () => {
    const connection = new RTCPeerConnection(ICE_SERVERS);
    connection.onicecandidate = handleICECandidateEvent;
    connection.ontrack = handleTrackEvent;
    return connection;
  };

  const handleReceivedOffer = (offer: any) => {
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
        .then((answer: any) => {
          rtcConnectionRef.current!.setLocalDescription(answer);
          socketRef.current!.emit('answer', answer, channelId);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleAnswer = (answer: any) => {
    rtcConnectionRef
      .current!.setRemoteDescription(answer)
      .catch((err: Error) => console.log(err));
  };

  const handleICECandidateEvent = (e: any) => {
    if (e.candidate) {
      socketRef.current!.emit('ice-candidate', e.candidate, channelId);
    }
  };

  const handleNewIceCandidateMsg = (incoming: any) => {
    const candidate = new RTCIceCandidate(incoming);
    rtcConnectionRef
      .current!.addIceCandidate(candidate)
      .catch((e: Error) => console.log(e));
  };

  const handleTrackEvent = (e: any) => {
    peerVideoRef.current!.srcObject = e.streams[0];
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
    socketRef.current!.emit('leave', channelId);

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
      <button onClick={cameraControl} type='button'>
        {camera ? 'StopCamera' : 'StartCamera'}
      </button>
      <button onClick={micControl} type='button'>
        {mic ? 'StopMic' : 'StartMic'}
      </button>
      <button onClick={leaveRoom} type='button'>
        Leave
      </button>
    </div>
  );
}
