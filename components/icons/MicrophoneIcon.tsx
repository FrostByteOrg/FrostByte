export default function MicrophoneIcon({
  width=6,
  height=6,
  className=''
} : {width?: number,
     height?: number, 
     className?: string}){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" 
      className={`icon icon-tabler icon-tabler-microphone w-${width} h-${height} ${className}`}
      viewBox="0 0 24 24" 
      stroke-width={1} 
      stroke="currentColor" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z"></path>
      <path d="M5 10a7 7 0 0 0 14 0"></path>
      <path d="M8 21l8 0"></path>
      <path d="M12 17l0 4"></path>
    </svg>
  );
}