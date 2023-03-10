import React, { useEffect, useRef, useState } from 'react';

export default function Video({ email, stream, muted }: any) {
  const ref = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
    if (muted) setIsMuted(muted);
  }, [stream, muted]);

  return (
    <div>
      <video ref={ref} muted={isMuted} autoPlay />
      <p>{email}</p>
    </div>
  );
}
