export default function ScreenShareIcon({
  width = 6, 
  height = 6,
  className=''
} : {width?: number,
    height?: number,
    className?: string}){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" 
      className={`icon icon-tabler icon-tabler-screen-share w-${width} h-${height} ${className}`} 
      viewBox="0 0 24 24" 
      stroke-width={2} 
      stroke="currentColor" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      strokeWidth={1}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9"></path>
      <path d="M7 20l10 0"></path>
      <path d="M9 16l0 4"></path>
      <path d="M15 16l0 4"></path>
      <path d="M17 4h4v4"></path>
      <path d="M16 9l5 -5"></path>
    </svg>
  );
}