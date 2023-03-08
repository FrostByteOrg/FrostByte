import { User } from '@/types/dbtypes';
import Image from 'next/image';
import { PresenceIndicator } from '../home/PresenceIndicator';

export default function UserIcon({ user }: { user: User }) {

  return (
    <div>
      {
        user.avatar_url ? (
          <img
            src={user.avatar_url!}
            alt={`${user.username}'s avatar`}
            className='flex-none w-7 h-7 mr-2 rounded-full'
          />
        ) : (
          <div className="flex-none bg-grey-900 rounded-full mr-3 h-7">
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-7 h-7 p-2 '
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
              />
            </svg>
          </div>
        )
      }
      <PresenceIndicator userId={user.id} />
    </div>
  );
}
