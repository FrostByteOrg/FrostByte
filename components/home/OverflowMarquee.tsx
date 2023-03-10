import { useState } from 'react';
import Marquee from 'react-fast-marquee';

export function OverflowMarquee({ content, maxLength }: { content: string, maxLength: number }) {
  const [ isHovered, setIsHovered ] = useState(false);

  return (
    <>
      {content.length > maxLength ? (
        <span
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className='inline-block overflow-hidden whitespace-nowrap max-w-full -mb-2'
        >
          {isHovered ? (
            <Marquee
              play={isHovered}
              direction={'left'}
              gradient={false}
              className='w-full'
            >
              {`${content}\u00A0\u00A0\u00A0\u00A0`}
            </Marquee>
          ) : (`${content.slice(0, maxLength + 1)}...`)}
        </span>
      ) : (content)
      }
    </>
  );
}
