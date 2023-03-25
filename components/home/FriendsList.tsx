import { useRelations } from '@/lib/store';
import styles from '@/styles/Chat.module.css';
import { DetailedProfileRelation, ProfileRelationshipType } from '@/types/dbtypes';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { FriendRequestItem } from './FriendRequestItem';
import { FriendsListItem } from './FriendsListItem';

export default function FriendsList() {
  const [ activeCategory, setActiveCategory ] = useState<ProfileRelationshipType>('friends');
  const relationships = useRelations();
  const [ dispRelations, setDispRelations ] = useState<DetailedProfileRelation[]>([]);

  useEffect(() => {
    console.log(activeCategory);
    setDispRelations(
      relationships.filter(
        (relation) => relation.relationship === activeCategory
      )
    );
  }, [activeCategory, relationships]);

  return (
    <>
      <div className={`${styles.chatHeader} px-5 pt-5 mb-3`}>
        <div className="flex flex-row items-center space-x-3">
          <h1 className="text-3xl font-semibold tracking-wide">
            Friends
          </h1>
          <h1 className='text-gray-500 text-2xl'>|</h1>
          <button
            className="rounded-md p-1 px-3 border-2 border-gray-500 hover:bg-gray-500"
            onClick={() => setActiveCategory('friends')}
            style={{
              backgroundColor: activeCategory === 'friends' ? '#8a94a6' : '',
              borderColor: activeCategory === 'friends' ? '#8a94a6' : '',
            }}
          >
            All
          </button>
          <button
            className="rounded-md p-1 px-3 border-2 border-gray-500 hover:bg-gray-500"
            onClick={() => setActiveCategory('friend_requested')}
            style={{
              backgroundColor: activeCategory === 'friend_requested' ? '#8a94a6' : '',
              borderColor: activeCategory === 'friend_requested' ? '#8a94a6' : '',
            }}
          >
            Pending
          </button>
          {/* <button
            className="rounded-md p-1 px-3 border-2 border-gray-500 hover:bg-gray-500"
            onClick={() => setActiveCategory('blocked')}
            style={{
              backgroundColor: activeCategory === 'blocked' ? '#8a94a6' : '',
              borderColor: activeCategory === 'blocked' ? '#8a94a6' : '',
            }}
          >
            Blocked
          </button> */}
        </div>
      </div>
      <div className="border-t-2 mx-5 border-grey-700 flex flex-col">
        {dispRelations.map((relation) => (
          relation.relationship === 'friends' ?
            <FriendsListItem key={relation.id} relation={relation} /> : <FriendRequestItem key={relation.id} relation={relation} />
        ))}
      </div>
    </>
  );
}
