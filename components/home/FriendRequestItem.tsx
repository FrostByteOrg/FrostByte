import {
  acceptFriendRequest,
  removeFriendOrRequest,
} from '@/services/friends.service';
import { DetailedProfileRelation } from '@/types/dbtypes';
import { useUser } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { CheckIcon } from '../icons/CheckIcon';
import UserIcon from '../icons/UserIcon';
import VerticalSettingsIcon from '../icons/VerticalSettingsIcon';
import { XIcon } from '../icons/XIcon';

export function FriendRequestItem({
  relation,
}: {
  relation: DetailedProfileRelation;
}) {
  const user = useUser();
  const supabase = createClientComponentClient();

  return (
    <div
      key={relation.id}
      className="flex flex-row items-center space-x-3 p-2 w-full hover:bg-grey-900 rounded-md transition-colors"
    >
      <UserIcon user={relation.target_profile} />
      <h1 className="text-xl font-semibold tracking-wide flex-grow">
        {relation.target_profile.username}
      </h1>
      <div className="flex flex-row space-x-2">
        {relation.initiator_profile_id !== user?.id && (
          <button
            className="rounded-md p-2 border-2 border-gray-500 hover:bg-gray-500"
            onClick={async () => {
              const { error } = await acceptFriendRequest(
                supabase,
                relation.id
              );
              if (error) {
                console.error(error);
              }
            }}
          >
            <CheckIcon className="fill-green-400" />
          </button>
        )}
        <button
          className="rounded-md p-2 border-2 border-gray-500 hover:bg-gray-500"
          onClick={async () => {
            const { error } = await removeFriendOrRequest(
              supabase,
              relation.id
            );

            if (error) {
              console.error(error);
            }
          }}
        >
          <XIcon className="fill-red-400" />
        </button>
      </div>
    </div>
  );
}
