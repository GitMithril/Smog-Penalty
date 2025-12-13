"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FeatureSteps } from "@/components/featuresteps";
import { MagicButton } from "@/components/ui/magic-button";

const features = [
  { 
    step: 'Step 1', 
    title: 'Data Acquisition',
    content: 'We gather real-time atmospheric data including aerosol optical depth, ozone levels, and cloud cover from satellite and ground sensors.', 
    image: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?q=80&w=2070&auto=format&fit=crop' 
  },
  { 
    step: 'Step 2',
    title: 'AI Analysis',
    content: 'Our advanced machine learning models process the environmental data to detect smog patterns and predict their impact on solar irradiance.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop'
  },
  { 
    step: 'Step 3',
    title: 'Power Prediction',
    content: 'Receive accurate forecasts of solar power output, allowing for optimized grid management and energy planning.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop'
  },
]

export function AboutUs() {
  return (
    <section id="about-us" className="w-full py-24 md:pt-64 md:pb-32 bg-gradient-to-b from-background/20 to-background/90 text-foreground overflow-hidden relative z-10">
      {/* Margin Lines */}
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="absolute top-12 left-0 h-[1px] bg-white/40" 
      />
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute bottom-12 left-0 h-[1px] bg-white/40" 
      />
      <motion.div 
        initial={{ height: 0 }}
        whileInView={{ height: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 9, ease: "easeInOut" }}
        className="absolute left-12 top-0 w-[1px] bg-white/40" 
      />
      <motion.div 
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 13, ease: "easeInOut" }}
        style={{ transformOrigin: "top" }}
        className="absolute right-12 top-0 w-[1px] bg-white/40 h-full" 
      />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Side: Text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col justify-center space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-sentient font-light tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Clarity in <span className="text-primary italic">Energy</span>
              </h2>
              <p className="text-foreground/80 md:text-lg/relaxed lg:text-xl/relaxed font-mono leading-relaxed">
                We are dedicated to optimizing solar energy production through advanced smog detection and analysis. 
                By leveraging cutting-edge machine learning algorithms, we predict power output fluctuations caused by atmospheric conditions, 
                enabling more efficient and reliable renewable energy systems for a cleaner future.
              </p>
            </div>
            
            {/* Decorative element */}
            <div className="w-36 h-1 bg-primary/50 rounded-full" />
          </motion.div>

          {/* Right Side: GIF */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[600px] aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-sm">
              <Image
                src="/solar_panel_gif.gif"
                alt="Solar panels adapting to environmental conditions"
                fill
                className="object-cover"
                unoptimized
              />
              {/* Subtle gradient overlay for better text contrast if needed, or just aesthetic */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-48">
        <FeatureSteps 
          features={features}
          title="How Does It Work?"
          autoPlayInterval={4000}
          imageHeight="h-[500px]"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-16 mt-32 pb-0 items-center">
        <Link href="/predictions">
            <MagicButton>Predictions</MagicButton>
        </Link>
        <Link href="/visualizations">
            <MagicButton>Visualizations</MagicButton>
        </Link>
      </div>
    </section>
  );
}
