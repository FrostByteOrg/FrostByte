import styles from '@/styles/svgs/Button.module.css';

export default function Button({
  fill1 = '#FFFFFF',
  fill2 = '#FFFFFF',
  stroke1Opacity = 0.6,
  stroke2Opacity = 1,
}: {
  fill1?: string;
  fill2?: string;
  stroke1Opacity?: number;
  stroke2Opacity?: number;
}) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 612 61"
      width={612}
      height={61}
    >
      <path
        className="st0"
        fill={fill1}
        stroke="#6a838d"
        strokeOpacity={stroke2Opacity}
        d="M602.5,60.5H9.5c0-5-4-9-9-9v-42c5,0,9-4,9-9h593c0,5,4,9,9,9v42C606.5,51.5,602.5,55.5,602.5,60.5z"
      />
      <path
        className="st0"
        fill={fill2}
        stroke="#000000"
        strokeOpacity={stroke1Opacity}
        d="M594.8,54.2H18c0-5-4-9-9-9V15.8c5,0,9-4,9-9h576.7c0,5,4,9,9,9v29.4C598.8,45.2,594.8,49.3,594.8,54.2z"
      />
    </svg>
  );
}
