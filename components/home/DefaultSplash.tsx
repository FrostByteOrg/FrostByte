import { FrostcordSnowflake } from '@/components/icons/FrostcordSnowflake';
import anim from '@/styles/Default.module.css';
import { useServers } from '@/lib/store';
// import TittleDetail from '../../public/tittleDetail.png';
// import Image from 'next/image';

export default function DefaultSplash() {
  const servers = useServers();
  return (
    <div className="w-full h-full flex flex-col items-center">
      <FrostcordSnowflake
        className={`fill-slate-600 w-full h-full ${anim.snowFlakeAnim}`}
        fillColor="#8a94a633"
      />
      {/* <Image
        className="w-[600px] mix-blend-multiply"
        src={TittleDetail}
        alt="TittleDetail"
      /> */}
      {servers.length === 0 && (
        <div className="w-full text-center text-gray-400 mb-8 italic animate-pulse">
          <h1 className="text-xl">
            {"Looks like you're not a part of any servers..."}
          </h1>
          <h2 className="text-xl">{'Why not create or join one?'}</h2>
        </div>
      )}
    </div>
  );
}
