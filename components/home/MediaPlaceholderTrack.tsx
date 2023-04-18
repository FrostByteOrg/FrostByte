import { useCurrentRoomFetchProfile, useCurrentRoomProfilesMap } from '@/lib/store';
import { ParticipantName } from '@livekit/components-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Participant } from 'livekit-client';
import { useEffect } from 'react';
import UserIcon from '../icons/UserIcon';

export function MediaPlaceholderTrack({ participant }: { participant: Participant }) {
  const profiles = useCurrentRoomProfilesMap();
  const fetchProfile = useCurrentRoomFetchProfile();
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchProfile(supabase, participant.identity);
  }, [supabase, fetchProfile, participant.identity]);

  return (
    <div key={participant.sid} className="p-2 h-fit">
      <div
        className={`
          bg-slate-600
          rounded-md
          border-2
          w-full
          h-full
          flex
          justify-center
          py-9
          ${participant.isSpeaking ? 'border-green-600' : 'border-gray-800'}
        `}
      >
        { !!profiles.get(participant.identity) && (
          <UserIcon user={profiles.get(participant.identity)!} indicator={false} className="!w-10 !h-10"/>
        )}
      </div>

      <ParticipantName
        participant={participant}
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
          right-2
          bottom-7
        "
      />
    </div>
  );
}
