export default function LogOutIcon(
  {width=6, 
    height=6,
    className='' } : {
    width?: number,
    height?: number,
    className?: string}){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" 
      className={`w-${width} h-${height} ${className}` }
      viewBox="0 0 24 24" 
      stroke-width={1} 
      stroke="currentColor" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M7 6a7.75 7.75 0 1 0 10 0"></path>
      <path d="M12 4l0 8"></path>
    </svg>
  );
}