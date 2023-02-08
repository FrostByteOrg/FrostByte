import AddServerIcon from '@/components/icons/AddServerIcon';
import { SearchBar } from '@/components/forms/Styles';
import { useState } from 'react';
import supabaseLogo from '@/public/supabaseLogo.png';
import Server from '@/components/home/Server';
import fireShipLogo from '@/public/fireShipLogo.png';
import { StaticImageData } from 'next/image';

//NOTE: this is a temp type just for testing...to be removed or possibly extracted to the types dir under client
type Server = {
  id: string;
  name: string;
  icon: StaticImageData;
  members: string;
  onlineMembers: string;
  channels: Channel[];
};
//NOTE: this is a temp type just for testing...to be removed or possibly extracted to the types dir under client
type Channel = {
  id: number;
  name: string;
  description: string;
  server_id: string;
};

//NOTE: this is temporary and just for testing
const SERVERS: Server[] = [
  {
    id: '1',
    name: 'Supabase',
    icon: supabaseLogo,
    members: '458',
    onlineMembers: '32',
    channels: [{ id: 1, name: 'general', description: '', server_id: '1' }],
  },
  {
    id: '53',
    name: 'Fireship',
    icon: fireShipLogo,
    members: '2833',
    onlineMembers: '181',
    channels: [
      { id: 1, name: 'general', description: '', server_id: '53' },
      {
        id: 2,
        name: 'off-topic',
        description: '',
        server_id: '53',
      },
    ],
  },
];

export default function ServerList() {
  //TODO: Extract and create single server component with props for clicked (boolean, when true, server is expanded and channels are shown)

  //TODO: Display default page (when user belongs to and has no servers)

  const [addServerhover, setAddServerHover] = useState(false);

  const [expanded, setExpanded] = useState('');

  return (
    <div className="main p-4">
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
          type="password"
          className={`${SearchBar}`}
          placeholder="Search"
        ></input>
      </div>
      {SERVERS.map((server) => (
        <span
          key={server.id}
          onClick={() =>
            expanded == server.id ? setExpanded('') : setExpanded(server.id)
          }
        >
          <Server server={server} expanded={expanded} />
        </span>
      ))}
    </div>
  );
}
