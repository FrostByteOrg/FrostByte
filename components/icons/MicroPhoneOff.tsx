export default function MicrophoneOff({
  width=6,
  height=6,
  className=''
} : {width?: number,
     height?: number
     className?: string}){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" 
      className={`icon icon-tabler icon-tabler-microphone-off w-${width} h-${height} ${className}`}
      viewBox="0 0 24 24" 
      stroke-width={2} 
      stroke="currentColor" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M3 3l18 18"></path>
      <path d="M9 5a3 3 0 0 1 6 0v5a3 3 0 0 1 -.13 .874m-2 2a3 3 0 0 1 -3.87 -2.872v-1"></path>
      <path d="M5 10a7 7 0 0 0 10.846 5.85m2 -2a6.967 6.967 0 0 0 1.152 -3.85"></path>
      <path d="M8 21l8 0"></path>
      <path d="M12 17l0 4"></path>
    </svg>
  );
}