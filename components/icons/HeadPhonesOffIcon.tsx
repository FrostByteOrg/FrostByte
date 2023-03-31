export default function HeadPhonesOffIcon({
  width=6,
  height=6,
  className=''
} : {
  width?: number,
  height?: number,
  className?: string
}){
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
      <path d="M3 3l18 18"></path>
      <path d="M4 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z"></path>
      <path d="M17 13h1a2 2 0 0 1 2 2v1m-.589 3.417c-.361 .36 -.86 .583 -1.411 .583h-1a2 2 0 0 1 -2 -2v-3"></path>
      <path d="M4 15v-3c0 -2.21 .896 -4.21 2.344 -5.658m2.369 -1.638a8 8 0 0 1 11.287 7.296v3"></path>
    </svg>
  );
}