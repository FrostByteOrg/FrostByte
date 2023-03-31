import { TrackBundle } from '@livekit/components-core';
import { ParticipantName, VideoTrack } from '@livekit/components-react';

export function MediaDispTrack({track}: { track: TrackBundle }) {
  return (
    <div className="p-2 h-fit">
      <VideoTrack
        source={track.publication.source}
        participant={track.participant}
        className={'rounded-lg border-2 border-gray-800'}
      />
      <ParticipantName
        participant={track.participant}
        className="
          text-lg
          font-semibold
          mt-2
          py-1
          px-2
          rounded-md
          bg-slate-900
          text-center
          float-right
          relative
          bottom-7
          right-2
        "
      />
    </div>
  );
}
