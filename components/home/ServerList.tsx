import AddServerIcon from '@/components/icons/AddServerIcon';
import { SearchBar } from '@/components/forms/Styles';
import mediaStyle from '@/styles/Livekit.module.css';
import { useEffect, useState } from 'react';
import Server from '@/components/home/Server';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import AddServerModal from '@/components/home/modals/AddServerModal';
import AddChannelModal from '@/components/home/modals/AddChannelModal';
import {
  useConnectionRef,
  useGetAllServerUserProfiles,
  useGetServers,
  useGetUserPermsForServer,
  useServers,
  useProfile,
} from '@/lib/store';
import { Tooltip } from 'react-tooltip';
import ServerSettingsModal from './modals/ServerSettingsModal';
import { ServersForUser } from '@/types/dbtypes';

import SidebarCallControl from '@/components/home/SidebarCallControl';
import { ConnectionState } from 'livekit-client';
import { useConnectionState } from '@livekit/components-react';
import MobileCallControls from './mobile/MobileCallControls';
import EditUserModal from './modals/EditUserModal';
import GearIcon from '../icons/GearIcon';

export default function ServerList() {
  //TODO: Display default page (when user belongs to and has no servers)
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddServer, setShowAddServer] = useState(false);
  const [expanded, setExpanded] = useState(0);
  const [currentServer, setCurrentServer] = useState<ServersForUser | null>(
    null
  );

  const user = useUser();
  const supabase = useSupabaseClient();
  const editUser = useProfile();


  const servers = useServers();
  const [filteredServers, setFilteredServers] = useState(servers);
  const getServers = useGetServers();

  const getUserServerPerms = useGetUserPermsForServer();
  const getAllServerProfiles = useGetAllServerUserProfiles();
  const isInVoice = useConnectionRef();

  const connectionState = useConnectionState();

  useEffect(() => {
    if (getServers) {
      if (user) {
        getServers(supabase, user.id);
        getAllServerProfiles(supabase, expanded);
      }
    }
  }, [getServers, supabase, user, expanded, getAllServerProfiles]);

  // HACK: At the time of component render, the servers are not yet loaded into the store.
  useEffect(() => {
    if (servers) {
      setFilteredServers(servers);
    }
  }, [servers]);

  //TODO: add isServer check

  return (
    <div className=" p-4 flex-col flex h-screen">
      <AddServerModal
        showModal={showAddServer}
        setShowModal={setShowAddServer}
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
      <div className={`${mediaStyle.appear}`}>
        <EditUserModal 
          showModal={showEditUser} 
          setShowModal={setShowEditUser} 
          user={editUser}/>
        <button 
          className="w-7 h-7 hover:text-grey-400"
          onClick={() => {setShowEditUser(true);}}>
          <GearIcon width={6} height={6}/>
        </button>
      </div>
      {connectionState === ConnectionState.Connected && <MobileCallControls />}
       
      <div className="pt-4 pb-4">
        <input
          type="text"
          className={`${SearchBar()}`}
          placeholder="Search"
          onKeyUp={(e) => {
            const value = (e.target as HTMLInputElement).value;

            // Filter servers
            const filteredServers = servers.filter((server) => {
              return server.servers.name
                .toLowerCase()
                .includes(value.toLowerCase());
            });

            setFilteredServers(filteredServers);
          }}
        />
      </div>
        
      <div className="flex-grow overflow-y-auto ">
        {filteredServers &&
        filteredServers
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
                      ? (setExpanded(server.server_id),
                      setCurrentServer(server))
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
      {isInVoice && (
        <div className={`w-full self-end mb-7 ${mediaStyle.disappear}`}>
          <SidebarCallControl />
        </div>
      )}
    </div>
  );
  
}
