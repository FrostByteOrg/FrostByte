import AddServerIcon from '@/components/icons/AddServerIcon';
import { SearchBar } from '@/components/forms/Styles';
import { useEffect, useState } from 'react';
import Server from '@/components/home/Server';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import styles from '@/styles/Servers.module.css';
import AddServerModal from '@/components/home/AddServerModal';
import AddChannelModal from '@/components/home/AddChannelModal';
import {
  useGetServers,
  useGetUserPermsForServer,
  useServers,
  useUserServerPerms,
} from '@/lib/store';
import { Tooltip } from 'react-tooltip';
import PlusIcon from '@/components/icons/PlusIcon';
import { ChannelPermissions, ServerPermissions } from '@/types/permissions';

export default function ServerList() {
  //TODO: Display default page (when user belongs to and has no servers)

  const [showAddServer, setShowAddServer] = useState(false);
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [expanded, setExpanded] = useState(0);

  const user = useUser();
  const supabase = useSupabaseClient();

  const servers = useServers();
  const getServers = useGetServers();

  const getUserServerPerms = useGetUserPermsForServer();
  const userServerPerms = useUserServerPerms();

  useEffect(() => {
    if (getServers) {
      if (user) {
        getUserServerPerms(supabase, expanded, user.id);
        getServers(supabase, user.id);
      }
    }
  }, [getServers, supabase, user, getUserServerPerms, expanded]);

  //TODO: add isServer check

  return (
    <div className=" p-4 flex-col flex h-screen">
      <AddServerModal
        showModal={showAddServer}
        setShowModal={setShowAddServer}
      />
      <AddChannelModal
        showModal={showAddChannelModal}
        setShowModal={setShowAddChannelModal}
        serverId={expanded}
      />
      <div className="flex pb-3 items-center border-b-2 border-grey-700">
        <h1 className=" text-5xl font-bold tracking-wide">Servers</h1>
        <div className="pt-2 ml-3  relative">
          <span
            className="hover:cursor-pointer"
            onClick={() => {
              setShowAddServer(true);
            }}
          >
            <span data-tooltip-id="addServer" data-tooltip-place="right">
              <AddServerIcon />
            </span>
          </span>
          <Tooltip
            className="z-20 !opacity-100 font-semibold text-base"
            style={{
              backgroundColor: '#21282b',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              lineHeight: '1.75rem',
            }}
            id="addServer"
            clickable
          >
            Add a server
          </Tooltip>
        </div>
      </div>
      <div className="pt-4 pb-4">
        <input
          type="text"
          className={`${SearchBar()}`}
          placeholder="Search"
        ></input>
      </div>

      <div className="overflow-y-auto ">
        {servers &&
          servers
            .sort(function (a, b) {
              var textA = a.servers.name.toUpperCase();
              var textB = b.servers.name.toUpperCase();
              return textA < textB ? -1 : textA > textB ? 1 : 0;
            })
            .map((server, idx, serverList) => {
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
      {userServerPerms & ServerPermissions.MANAGE_MESSAGES ||
      userServerPerms & ServerPermissions.OWNER ||
      userServerPerms & ServerPermissions.ADMINISTRATOR ? (
          <Tooltip
            className="z-20 !opacity-100 font-semibold "
            style={{
              backgroundColor: '#21282b',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              lineHeight: '1.75rem',
            }}
            id="serverSettings"
            clickable
            openOnClick={true}
          >
            <div
              className="flex justify-center items-center hover:text-grey-300 cursor-pointer"
              onClick={() => {
                setShowAddChannelModal(true);
              }}
            >
              <PlusIcon width={5} height={5} />
              <span className="ml-1">New channel</span>
            </div>
          </Tooltip>
        ) : (
          ''
        )}
    </div>
  );
}
