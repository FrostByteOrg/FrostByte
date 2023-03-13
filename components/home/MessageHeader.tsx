import { ServerUser, User } from '@/types/dbtypes';
import { Tooltip } from 'react-tooltip';
import { MiniProfile } from '../forms/MiniProfile';
import UserIcon from '../icons/UserIcon';

export function MessageHeader({
  profile,
  server_user,
  message_id,
  message_color,
  display_time,
  edited
}: {
  profile: User,
  server_user: ServerUser,
  message_id: number,
  message_color: string,
  display_time: string,
  edited: boolean
}) {
  return (
    <div className="flex-grow flex flex-row">
      <Tooltip id={profile.id} className='z-20 !w-12' clickable noArrow>
        <MiniProfile userId={profile.id} messageId={message_id} />
      </Tooltip>
      <UserIcon user={profile} />
      <div className="flex-grow flex items-center">
        <div
          className="text-xl font-semibold tracking-wider mr-2"
          data-tooltip-id={profile.id}
          style={{
            // Check for the first role that has a non-null color and use that
            color: message_color,
          }}
        >
          {server_user.nickname || profile.username}
        </div>
        <div className="text-xs tracking-wider text-grey-300 mt-1">
          {display_time}{' '}
          {edited && (
            <span className="text-gray-400">(edited)</span>
          )}
        </div>
      </div>
    </div>
  );
}
