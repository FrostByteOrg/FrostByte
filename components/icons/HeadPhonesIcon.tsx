export default function HeadPhonesIcon({
  width=6,
  height=6,
  className=''
} : {width?: number, 
     height?: number,
     className?: string}){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" 
      className={`w-${width} h-${height} ${className}`}
      viewBox="0 0 24 24" 
      stroke-width={1} 
      stroke="currentColor" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z"></path>
      <path d="M15 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z"></path>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3"></path>
    </svg>
  );
}