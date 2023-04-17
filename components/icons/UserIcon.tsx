import { User } from '@/types/dbtypes';
import { PresenceIndicator } from '../home/PresenceIndicator';
import { DefaultUserIcon } from './DefaultUserIcon';

export default function UserIcon({ user, className, indicator, isStatic }: { user: User, className?: string, indicator?: boolean, isStatic?: boolean }) {

  return (
    <div>
      {
        user.avatar_url ? (
          <img
            src={`${user.avatar_url!}?${isStatic && `${new Date().getTime()}`}`}
            alt={`${user.username}'s avatar`}
            className={`flex-none w-7 h-7 mr-2 rounded-full ${className}`}
          />
        ) : <DefaultUserIcon className={className} />
      }
      {indicator === false ? (
        <div className='hidden'/>
      ) : <PresenceIndicator userId={user.id} />}
    </div>
  );
}
