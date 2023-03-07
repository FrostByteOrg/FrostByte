import { useOnlinePresenceRef } from '@/context/ChatCtx';

export function PresenceIndicator({ userId }: { userId: string }) {
  const channel = useOnlinePresenceRef()!;

  return (
    <div
      className={`
        float-left
        w-4
        h-4
        rounded-full
        ${channel.presenceState()[userId] ? 'bg-green-600' : 'bg-slate-500'}
        border-2
        -mt-3
        mr-2
        z-10
        border-slate-800/50
      `}
    />
  );
}
