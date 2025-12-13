export const Logo = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="18" height="12" x="3" y="2" rx="2" />
      <path d="M3 8h18" />
      <path d="M9 2v12" />
      <path d="M15 2v12" />
      <path d="M8 14v8" />
      <path d="M16 14v8" />
      <path d="M12 14v8" />
    </svg>
  );
};
