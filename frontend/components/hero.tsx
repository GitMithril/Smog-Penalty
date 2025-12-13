"use client";

import Link from "next/link";
import { GL } from "./gl";
import { Button } from "./ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

export function Hero() {
  const [hovering, setHovering] = useState(false);

  const scrollToAboutUs = () => {
    const element = document.getElementById('about-us');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-svh justify-center relative">
      <div className="absolute inset-0">
        <GL hovering={hovering} />
      </div>

      <div className="text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-5xl sm:text-6xl md:text-6xl font-sentient"
        >
          Smog reduces power <br />
          <i className="font-light">We predict,</i> How much?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="font-mono text-sm sm:text-base z-10 text-foreground/100 text-balance mt-8 max-w-[440px] mx-auto [text-shadow:0_0_40px_rgba(0,0,0,0.8)]"
        >
          {/* Whats hurting your power systems? Could it be the bad weather...? */}
          Some bad weather today?
        </motion.p>

        <div className="contents max-sm:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="inline-block"
          >
            <Button
              className="mt-18"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onClick={scrollToAboutUs}
            >
              Find Out
            </Button>
          </motion.div>
        </div>
        <div className="contents sm:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="inline-block"
          >
            <Button
              size="sm"
              className="mt-14"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onClick={scrollToAboutUs}
            >
              Proceed
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
