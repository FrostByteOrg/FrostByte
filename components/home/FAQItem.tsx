import { useState } from 'react';
import PlusIcon2 from '@/components/icons/PlusIcon2';
import MinusIcon from '@/components/icons/MinusIcon';

export default function FAQItem({
  question = '',
  answer = '',
}: {
  question?: string;
  answer?: JSX.Element | string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setExpanded(!expanded)}
        className={`${
          hovered ? 'bg-grey-600 cursor-pointer' : 'bg-grey-700'
        } rounded-lg py-5 px-4  mt-3 relative z-10 flex justify-between tracking-wider text-xl font-semibold text-grey-100`}
      >
        <div>{question}</div>
        {expanded ? (
          <MinusIcon color="#4abfe8" />
        ) : (
          <PlusIcon2 color="#4abfe8" />
        )}
      </div>
      {expanded ? (
        <div className="relative mt-4 -top-5 bg-grey-800 py-6 pb-5 px-6 rounded-lg font-medium tracking-wide">
          {answer}
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
