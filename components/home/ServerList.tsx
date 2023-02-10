import AddServerIcon from '@/components/icons/AddServerIcon';
import { SearchBar } from '@/components/forms/Styles';
import { useEffect, useState } from 'react';
import supabaseLogo from '@/public/supabaseLogo.png';
import Server from '@/components/home/Server';
import fireShipLogo from '@/public/fireShipLogo.png';
import { StaticImageData } from 'next/image';
import type { Server as ServerType, ServerUser } from  '@/types/dbtypes';
import { useChannelIdValue } from '@/context/ChatCtx';
import { useUser } from '@supabase/auth-helpers-react';
import { ServersForUser } from '@/types/dbtypes';
import { getServer, getServerForUser, getServersForUser } from '@/services/server.service';
import { useRealtime } from '@/lib/Store';

//NOTE: this is a temp type just for testing...to be removed or possibly extracted to the types dir under client
type Channel = {
  id: number;
  name: string;
  description: string;
  server_id: string;
};

// //NOTE: this is temporary and just for testing
// const SERVERS: Server[] = [
//   {
//     id: 1,
//     name: 'Supabase',
//     icon: supabaseLogo,
//     members: '458',
//     onlineMembers: '32',
//     channels: [{ id: 13, name: 'general', description: '', server_id: '1' }],
//   },
//   {
//     id: 53,
//     name: 'Fireship',
//     icon: fireShipLogo,
//     members: '2833',
//     onlineMembers: '181',
//     channels: [
//       { id: 13, name: 'general', description: '', server_id: '53' },
//       {
//         id: 13,
//         name: 'off-topic',
//         description: '',
//         server_id: '53',
//       },
//     ],
//   },
// ];

export default function ServerList() {

  //TODO: fetch server_users via profile id, select server_id -> fetch channels via this server_id && fetch servers with server_id
  //This should at minimum return server_id, author_id (serveruser id), server name, channel id, channel name

  //TODO: Display default page (when user belongs to and has no servers)

  const [ addServerhover, setAddServerHover ] = useState(false);

  const [expanded, setExpanded] = useState(0);

  const channelId = useChannelIdValue();
  const user = useUser();

  const [ userId, setUserId ] = useState('');

  const [ servers, setServers ] = useState<ServersForUser[]>([]);

  useRealtime<ServerUser>(
    'public:server_users',
    [
      {
        type: 'postgres_changes',
        filter: { event: 'INSERT', schema: 'public', table: 'server_users' },
        callback: async (payload) => {

          const { data, error } = await getServerForUser((payload.new as ServerUser).id);

          if (error) {
            console.error(error);
            return;
          }
          setServers(servers.concat(data));
        }
      }
    ]
  );

  //TODO: once we have servers, fetch their channels
  useEffect(() => {
    if (user) {
      setUserId(user.id);

      const handleAsync = async () => {
        const { data, error } = await getServersForUser(user.id);

        if (error) {
          console.error(error);
        }

        if (data) {
          setServers(data);
        }
      };
      handleAsync();
    }
  }, [user]);


  //TODO: add isServer check

  return (
    <div className="main p-4 min-h-0">
      <div className="flex pb-3 items-center border-b-2 border-grey-700">
        <h1 className=" text-5xl font-bold tracking-wide">Servers</h1>
        <div
          className="pt-2 ml-3 hover:cursor-pointer"
          onMouseEnter={() => setAddServerHover(true)}
          onMouseLeave={() => setAddServerHover(false)}
        >
          <AddServerIcon hovered={addServerhover} />
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
      { servers && servers.map((server, idx) => {
        {/* @ts-expect-error This is valid */}
        return <span key={server.server_id} onClick={() => {
          //  @ts-expect-error This is valid
          return  expanded == server.server_id ? setExpanded(0) : setExpanded(server.server_id);
        }} >
          <Server server={server} expanded={expanded} />
        </span>;
      })}
    </div>
  );
}
