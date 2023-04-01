export default function ScreenShareOff({
  width=6,
  height=6,
  className=''
} : {width?: number,
    height?: number,
    className?: string}){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" 
      className={`icon icon-tabler icon-tabler-screen-share-off w-${width} h-${height} ${className}`}
      viewBox="0 0 24 24" 
      stroke-width={1} 
      stroke="currentColor" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9"></path>
      <path d="M7 20l10 0"></path>
      <path d="M9 16l0 4"></path>
      <path d="M15 16l0 4"></path>
      <path d="M17 8l4 -4m-4 0l4 4"></path>
    </svg>
  );
}