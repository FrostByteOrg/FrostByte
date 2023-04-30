import { FrostcordSnowflake } from '@/components/icons/FrostcordSnowflake';
import { useServers } from '@/lib/store';

export default function DefaultSplash() {
  const servers = useServers();
  return (
    <div className="w-full h-full flex flex-col items-center">
      {/* <video
        src="./Render_4.mp4"
        autoPlay={true}
        muted
        className="mix-blend-multiply absolute min-w-[1920px] min-h-[1080px] w-full h-full opacity-95"
      />
      <video
        src="./Render_5.mp4"
        autoPlay={true}
        muted
        className="mix-blend-multiply absolute min-w-[1920px] min-h-[1080px] w-full h-full"
      /> */}
      <FrostcordSnowflake
        className="fill-slate-600 w-full h-full"
        fillColor="#8a94a633"
      />
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
