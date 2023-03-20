export default function LoadingIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={`${className} rounded-xl`}
    >
      <path
        fill="none"
        stroke-dasharray="15"
        stroke-dashoffset="15"
        stroke-linecap="round"
        stroke-width="2"
        d="M12 3C16.9706 3 21 7.02944 21 12"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.3s"
          values="15;0"
        />
        <animateTransform
          attributeName="transform"
          dur="1.5s"
          repeatCount="indefinite"
          type="rotate"
          values="0 12 12;360 12 12"
        />
      </path>
    </svg>
  );
}
