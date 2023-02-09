import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import useSocket from '../../hooks/useSocket';

export default function Channel() {
  useSocket();

  const [camera, setCamera] = useState(true);

  const router = useRouter();

  const userVideoRef = useRef();
  const peerVideoRef = useRef();

  const rtcConnectionRef = useRef(null);
  const socketRef = useRef<Socket>();
  const userStreamRef = useRef<HTMLVideoElement>();
  const hostRef = useRef(false);

  const { id: room } = router.query;

  const ICE_SERVERS = {
    iceServers: [
      {
        urls: 'stun:openrealy.metered.ca:80',
      },
    ],
  };

  const handleRoomCreated = () => {
    hostRef.current = true;
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: { width: 500, height: 500 },
      })
      .then((stream) => {
        // @ts-expect-error
        userStreamRef.current = stream;
        // @ts-expect-error
        userVideoRef.current.srcObject = stream;
        // @ts-expect-error
        userVideoRef.current.onloadedmetadata = () => {
          // @ts-expect-error
          userVideoRef.current.play();
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
        video: { width: 500, height: 500 },
      })
      .then((stream: any) => {
        userStreamRef.current = stream;
        // @ts-expect-error
        userVideoRef.current.srcObject = stream;
        // @ts-expect-error
        userVideoRef.current.onloadedmetadata = () => {
          // @ts-expect-error
          userVideoRef.current.play();
        };
        // @ts-expect-error
        socketRef.current.emit('ready', room);
      });
  };

  const initateCall = () => {
    if (hostRef.current) {
      // @ts-expect-error
      rtcConnectionRef.current = createPeerConnection();
      // @ts-expect-error
      rtcConnectionRef.current.addTrack(
        // @ts-expect-error
        userStreamRef.current.getTracks()[0],
        userStreamRef.current
      );
      // @ts-expect-error
      rtcConnectionRef.current.addTrack(
        // @ts-expect-error
        userStreamRef.current.getTracks()[1],
        userStreamRef.current
      );
      // @ts-expect-error
      rtcConnectionRef.current
        .createOffer()
        .then((offer: any) => {
          // @ts-expect-error
          rtcConnectionRef.current.setLocalDescription(offer);
          // @ts-expect-error
          socketRef.current.emit('offer', offer, room);
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  };

  const onPeerLeave = () => {
    hostRef.current = true;
    if (peerVideoRef.current.srcObject) {
      peerVideoRef.current.srcObject
        .getTracks()
        .forEach((track: any) => track.stop());
    }

    if (rtcConnectionRef.current) {
      //@ts-expect-error
      rtcConnectionRef.current.ontrack = null;
      //@ts-expect-error
      rtcConnectionRef.current.oniccecandidate = null;
      //@ts-expect-error
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
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
      // @ts-expect-error
      rtcConnectionRef.current = createPeerConnection();
      // @ts-expect-error
      rtcConnectionRef.current.addTrack(
        // @ts-expect-error
        userStreamRef.current.getTracks()[0],
        userStreamRef.current
      );
      // @ts-expect-error
      rtcConnectionRef.current.addTrack(
        // @ts-expect-error
        userStreamRef.current.getTracks()[1],
        // @ts-expect-error
        userStreamREf.current
      );
      // @ts-expect-error
      rtcConnectionRef.current.setRemoteDescription(offer);
      // @ts-expect-error
      rtcConnectionRef.current
        .createAnswer()
        .then((answer: any) => {
          // @ts-expect-error
          rtcConnectionRef.current.setLocalDescription(answer);
          // @ts-expect-error
          socketRef.current.emit('answer', answer, room);
        })
        .catch((err: Error) => {
          console.log(err);
        });
    }
  };

  const handleAnswer = (answer: any) => {
    // @ts-expect-error
    rtcConnectionRef.current
      .setRemoteDescription(answer)
      .catch((err: Error) => console.log(err));
  };

  const handleICECandidateEvent = (e: any) => {
    if (e.candidate) {
      // @ts-expect-error
      socketRef.current.emit('ice-candidate', e.candidate, room);
    }
  };

  const handleNewIceCandidateMsg = (incoming: any) => {
    const candidate = new RTCIceCandidate(incoming);
    // @ts-expect-error
    rtcConnectionRef.current
      .addIceCandidate(candidate)
      .catch((e: Error) => console.log(e));
  };

  const handleTrackEvent = (e: any) => {
    // @ts-expect-error
    peerVideoRef.current.srcObject = e.streams[0];
  };

  const toggleMediaStream = (type: any, state: any) => {
    userStreamRef.current.getTracks().forEach((track: any) => {
      if (track.kind === type) {
        track.enabled = !state;
      }
    });
  };

  const cameraControl = () => {
    toggleMediaStream('video', camera);
    setCamera((prev: any) => !prev);
  };

  const leaveRoom = () => {
    //@ts-expect-error
    socketRef.current.emit('leave', room);

    if (userVideoRef.current?.srcObject) {
      userVideoRef.current.srcObject
        // @ts-expect-error
        .getTracks()
        .forEach((track: any) => track.stop());
    }
    // @ts-expect-error
    if (peerVideoRef.current.srcObject) {
      // @ts-expect-error
      peerVideoRef.current.srcObject
        // @ts-expect-error
        .getTracks()
        .forEach((track: any) => track.stop());
    }

    if (rtcConnectionRef.current) {
      // @ts-expect-error
      rtcConnectionRef.current.ontrack = null;
      // @ts-expect-error
      rtcConnectionRef.current.onicecandidate = null;
      // @ts-expect-error
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }
    router.push('/');
  };

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.emit('join', room);

    socketRef.current.on('created', handleRoomCreated);

    socketRef.current.on('joined', handleRoomJoined);

    socketRef.current.on('ready', initateCall);

    socketRef.current.on('leave', onPeerLeave);

    socketRef.current.on('connection-offer', handleReceivedOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice', handleNewIceCandidateMsg);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [room]);

  return (
    <div>
      <video autoPlay ref={userVideoRef} />
      <video autoPlay ref={peerVideoRef} />
      <button onClick={cameraControl} type='button'>
        {camera ? 'Stop' : 'Start'}
      </button>
      <button onClick={leaveRoom} type='button'>
        Leave
      </button>
    </div>
  );
}
