import AddServerIcon from '@/components/icons/AddServerIcon';
import { SearchBar } from '@/components/forms/Styles';
import { useEffect, useState } from 'react';
import Server from '@/components/home/Server';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import styles from '@/styles/Servers.module.css';
import AddServerModal from '@/components/home/AddServerModal';
import { useGetServers, useServers } from '@/lib/store';

export default function ServerList() {
  //TODO: fetch server_users via profile id, select server_id -> fetch channels via this server_id && fetch servers with server_id
  //This should at minimum return server_id, author_id (serveruser id), server name, channel id, channel name

  //TODO: Display default page (when user belongs to and has no servers)

  const [addServerhover, setAddServerHover] = useState(false);
  const [showAddServer, setShowAddServer] = useState(false);
  const [expanded, setExpanded] = useState(0);

  const user = useUser();
  const supabase = useSupabaseClient();

  const servers = useServers();
  const getServers = useGetServers();

  useEffect(() => {
    if (getServers) {
      if (user) {
        getServers(supabase, user.id);
      }
    }
  }, [getServers, supabase, user]);

  //TODO: add isServer check

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
          className={`${SearchBar()}`}
          placeholder="Search"
        ></input>
      </div>
      {servers &&
        servers.map((server, idx, serverList) => {
          if (server) {
            return (
              <span
                key={server.server_id}
                onClick={() => {
                  return expanded !== server.server_id
                    ? setExpanded(server.server_id)
                    : '';
                }}
              >
                <Server
                  server={server.servers}
                  expanded={expanded}
                  isLast={idx == serverList.length - 1}
                  setExpanded={setExpanded}
                />
              </span>
            );
          }
        })}
    </div>
  );
}
