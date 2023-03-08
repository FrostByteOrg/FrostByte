import { User } from '@/types/dbtypes';
import UserIcon from '../icons/UserIcon';
import { SearchBar } from './Styles';

export function MiniProfile({ user, nickname }: { user: User, nickname?: string }) {
  return (
    <div className="flex flex-col space-y-2 items-center p-3">
      <UserIcon user={user} className='w-9 h-9'/>
      { nickname && <span>
        {nickname}
      </span> }
      <span>{user.username}</span>
      <input
        type="text"
        className={`${SearchBar}`}
        placeholder={`Message @${user.username}`}
      />
    </div>
  );
}
