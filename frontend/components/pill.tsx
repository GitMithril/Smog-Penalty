import { cn } from "@/lib/utils";

export const Pill = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div
      className={cn(
        "bg-black font-medium text-white backdrop-blur-xs font-mono text-sm inline-flex items-center justify-center px-3 h-8 border border-white rounded-lg",
        className
      )}
    >
      <span className="inline-block size-2.5 rounded-full bg-primary mr-2 shadow-glow shadow-primary/50" />

      {children}
    </div>
  );
};
