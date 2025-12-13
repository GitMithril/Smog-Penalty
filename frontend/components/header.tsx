"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { usePathname } from "next/navigation";

export const Header = () => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const viewportHeight = window.innerHeight;
    // Hide if scrolled past hero (e.g. 80% of viewport)
    if (latest > viewportHeight * 0.8) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  if (pathname === "/dashboard") return null;

  return (
    <motion.div
      variants={{
        visible: { y: 0 },
        hidden: { y: "-150%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed z-50 pt-4 md:pt-14 top-0 left-0 w-full"
    >
      <header className="flex items-center justify-between container">
        {/* <Link href="/">
          <Logo className="w-[20px] md:w-[24px]" />
        </Link> */}
        <nav className="flex max-lg:hidden absolute left-1/2 -translate-x-1/2 items-center justify-center gap-x-10">
          {["Predictions", "Visualizations"].map((item) => (
            <Link
              className="uppercase inline-block font-mono text-foreground/60 hover:text-foreground/100 duration-150 transition-colors ease-out"
              href={item === "Predictions" ? "/dashboard" : `#${item.toLowerCase()}`}
              key={item}
            >
              {item}
            </Link>
          ))}
        </nav>
        <MobileMenu />
      </header>
    </motion.div>
  );
};
