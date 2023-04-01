import { Channel } from '@/types/dbtypes';
import { useState } from 'react';
import Marquee from 'react-fast-marquee';

export default function ChannelName(channel: Channel) {

  const [isChannelHovered, setIsChannelHovered] = useState(false);

  return(

    <div className="ml-2 text-sm font-semibold tracking-wide text-grey-200 max-w-[10ch] overflow-hidden hover:overflow-visible">
      {channel.name.length > 10 ? (
        <span
          onMouseEnter={() => setIsChannelHovered(true)}
          onMouseLeave={() => setIsChannelHovered(false)}
        >
          {isChannelHovered ? (
            <Marquee
              play={isChannelHovered}
              direction={'left'}
              gradient={false}
            >
              {`${channel.name}\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}
            </Marquee>
          ) : (
            `${channel.name.slice(0, 9)}...`
          )}
        </span>                  
      ) : (
        channel.name
      )}
    </div>
  );
}
