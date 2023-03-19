export function Input(bg = 'bg-inherit ') {
  return `w-full
py-2 
pl-6
self-start
text-base
font-normal
placeholder:text-white
placeholder:opacity-80     
rounded-2xl
transition
ease-in-out
focus:outline-frost-50
m-0
focus:outline-none
${bg} 
flex-1`;
}

export function SearchBar(bg = 'bg-grey-950 ') {
  return `w-full
py-2 
pl-5
self-start
text-base
font-normal
placeholder:text-white
placeholder:opacity-70     
rounded-xl
transition
ease-in-out
m-0
focus:outline-none
${bg}
flex-1`;
}
