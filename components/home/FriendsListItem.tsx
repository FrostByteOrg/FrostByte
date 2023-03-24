import { DetailedProfileRelation } from '@/types/dbtypes';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import UserIcon from '../icons/UserIcon';
import VerticalSettingsIcon from '../icons/VerticalSettingsIcon';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { removeFriendOrRequest } from '@/services/friends.service';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export function FriendsListItem({ relation }: { relation: DetailedProfileRelation }) {
  const supabase = useSupabaseClient();
  return (
    <div key={relation.id} className="flex flex-row items-center space-x-3 p-2 w-full hover:bg-grey-900 rounded-md transition-colors">
      <UserIcon user={relation.target_profile} />
      <h1 className="text-xl font-semibold tracking-wide flex-grow">
        {relation.target_profile.username}
      </h1>
      <div className='flex flex-row space-x-2'>
        <button
          className="rounded-md p-3 border-2 border-gray-500 hover:bg-gray-500"
          onClick={() => {
            console.log('DM');
          }}
        >
          <ChannelMessageIcon />
        </button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="rounded-md p-2 border-2 border-gray-500 hover:bg-gray-500"
              onClick={() => {
                console.log('Options');
              }}
            >
              <VerticalSettingsIcon />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className='ContextMenuContent' side='left'>
            <DropdownMenu.Item
              className='ContextMenuItem'
              onClick={async () => await removeFriendOrRequest(supabase, relation.id)}
            >
              Remove friend
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
