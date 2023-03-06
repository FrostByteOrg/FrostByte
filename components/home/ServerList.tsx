import AddServerIcon from '@/components/icons/AddServerIcon';
import { SearchBar } from '@/components/forms/Styles';
import { useEffect, useRef, useState } from 'react';
import Server from '@/components/home/Server';
import type { Server as ServerType, ServerUser } from '@/types/dbtypes';
import { useChannelIdValue } from '@/context/ChatCtx';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { ServersForUser } from '@/types/dbtypes';
import { getServerForUser, getServersForUser } from '@/services/server.service';
import { useRealtime } from 'hooks/useRealtime';
import styles from '@/styles/Servers.module.css';
import AddServerModal from '@/components/home/AddServerModal';

export default function ServerList() {
  //TODO: fetch server_users via profile id, select server_id -> fetch channels via this server_id && fetch servers with server_id
  //This should at minimum return server_id, author_id (serveruser id), server name, channel id, channel name

  //TODO: Display default page (when user belongs to and has no servers)

  const [addServerhover, setAddServerHover] = useState(false);
  const [showAddServer, setShowAddServer] = useState(false);
  const supabase = useSupabaseClient();
  const [expanded, setExpanded] = useState(0);

  const channelId = useChannelIdValue();
  const user = useUser();

  const [userId, setUserId] = useState('');

  const [servers, setServers] = useState<ServersForUser[]>([]);

  //TODO: realtime for delete server_users and update, delete servers

  useRealtime<ServerUser>('public:server_users', [
    {
      type: 'postgres_changes',
      filter: { event: 'INSERT', schema: 'public', table: 'server_users' },
      callback: async (payload) => {
        const { data, error } = await getServerForUser(
          supabase,
          (payload.new as ServerUser).id
        );

        if (error) {
          console.error(error);
          return;
        }

        setServers(servers.concat(data));
      },
    },
  ]);

  //TODO: once we have servers, fetch their channels
  useEffect(() => {
    if (user) {
      setUserId(user.id);

      const handleAsync = async () => {
        const { data, error } = await getServersForUser(supabase, user.id);

        if (error) {
          console.error(error);
        }

        if (data) {
          setServers(data);
        }
      };
      handleAsync();
    }
  }, [user, supabase]);

  //TODO: add isServer check

  //TODO: onClick, display add server modal, create server input will be name and image

  return (
    <div className=" p-4 min-h-0">
      <AddServerModal
        showModal={showAddServer}
        setShowModal={setShowAddServer}
      />
      <div className="flex pb-3 items-center border-b-2 border-grey-700">
        <h1 className=" text-5xl font-bold tracking-wide">Servers</h1>
        <div className="pt-2 ml-3  relative">
          <span
            className="hover:cursor-pointer"
            onMouseEnter={() => setAddServerHover(true)}
            onMouseLeave={() => setAddServerHover(false)}
            onClick={() => {
              setShowAddServer(true);
            }}
          >
            <AddServerIcon hovered={addServerhover} />
          </span>
          {addServerhover ? (
            <div className="absolute w-10 top-2 left-7 flex">
              <div
                className={`${styles.arrow} absolute -left-2 top-[6px]`}
              ></div>
              <div className=" bg-grey-950 rounded-lg py-1 px-2">
                Add a Server
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className="pt-4 pb-4">
        <input
          type="text"
          className={`${SearchBar}`}
          placeholder="Search"
        ></input>
      </div>
      {/* TODO: fix idx -> server.id */}
      {servers &&
        servers.map((server, idx, serverList) => {
          {
            /* @ts-expect-error This is valid */
          }
          return (
            <span
              key={server.server_id}
              onClick={() => {
                //  @ts-expect-error This is valid
                return expanded == server.server_id
                  ? setExpanded(0)
                  : setExpanded(server.server_id);
              }}
            >
              <Server
                server={server}
                expanded={expanded}
                isLast={idx == serverList.length - 1}
              />
            </span>
          );
        })}
    </div>
  );
}
