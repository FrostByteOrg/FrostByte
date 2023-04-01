export default function JoinCallIcon({
  width=6,
  height=6,
  className=''
} : {width?: number,
     height?: number,
     className?: string
}){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" 
      className={`icon icon-tabler icon-tabler-phone-outgoing w-${width} h-${height} ${className}`} 
      viewBox="0 0 24 24" 
      stroke-width="1"
      stroke="currentColor" 
      fill="none" 
      stroke-linecap="round" 
      stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"></path>
      <path d="M15 9l5 -5"></path>
      <path d="M16 4l4 0l0 4"></path>
    </svg>
  );
}