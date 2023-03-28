import { useOnlineUsers } from '@/lib/store';

export function PresenceIndicator({ userId }: { userId: string }) {
  const onlineUsers = useOnlineUsers();

  return (
    <div
      className={`
        relative
        float-left
        w-4
        h-4
        rounded-full
        z-10
        ${onlineUsers[userId] ? 'bg-green-600' : 'bg-slate-500'}
        border-2
        -mt-3
        mr-2
        border-slate-800/50
      `}
    />
  );
}
