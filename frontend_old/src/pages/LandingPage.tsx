import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Beams from '../components/Beams';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-neutral-950 text-white font-sans selection:bg-blue-500/30">
      {/* Background Beams */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Beams />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl space-y-8"
        >
          {/* Badge / Pill */}
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-white/80 backdrop-blur-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
            AI-Powered Energy Analysis
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            <span className="block text-white drop-shadow-sm">Is bad weather losing you money?</span>
            <span className="block mt-2 bg-gradient-to-br from-blue-200 via-blue-400 to-emerald-400 bg-clip-text text-transparent pb-2">
              Save Energy. Save Money.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Stop guessing. Use our advanced machine learning models to predict solar efficiency and optimize your energy consumption today.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="group relative h-12 px-8 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 transition-all duration-300 font-semibold text-base shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:-translate-y-0.5"
            >
              Predict Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
             <Button 
              variant="ghost"
              size="lg"
              className="h-12 px-8 rounded-full text-white hover:bg-white/10 hover:text-white transition-all duration-300 text-base"
            >
              Learn more
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
