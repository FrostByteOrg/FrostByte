export default function VideoCameraIcon({
  width = 6,
  height = 6,
  className = ''
}: {
  width?: number;
  height?: number;
  className?: string
}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" 
      className={`icon icon-tabler icon-tabler-video w-${width} h-${height} ${className}`} 
      viewBox="0 0 24 24" 
      stroke-width={1} 
      stroke="currentColor" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z"></path>
      <path d="M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>
    </svg>
  );
}
