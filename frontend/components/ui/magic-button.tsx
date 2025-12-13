"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const MagicButton = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex h-14 overflow-hidden rounded-lg p-[1px] focus:outline-none group",
        className
      )}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_33%,#000000_0%,#FFFFFF_50%,#000000_95%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-black px-12 text-base font-medium text-white backdrop-blur-3xl font-mono uppercase transition-colors duration-200 group-hover:bg-neutral-900">
        {children}
      </span>
    </button>
  );
};
