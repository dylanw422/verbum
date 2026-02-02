"use client";

import { Points, PointMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  Eye,
  BrainCircuit,
  Activity,
  ScanLine,
  History,
  Target,
  Move,
  Cpu,
  Keyboard,
  MousePointer2,
  Heart,
  Flame,
} from "lucide-react";
import * as random from "maath/random/dist/maath-random.cjs";
import { useRouter } from "next/navigation";
import { useRef, Suspense, useState } from "react";

// --- Reusing the StarField for consistency ---
function StarField(props: any) {
  const ref = useRef<any>(null);
  const [sphere] = useState(
    () => random.inSphere(new Float32Array(6000), { radius: 1.5 }) as Float32Array,
  );

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x -= delta / 15;
    ref.current.rotation.y -= delta / 20;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#f43f5e"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  );
}

// --- Reusable Components ---

const SectionHeading = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div className="flex items-center gap-3 mb-6 mt-12 border-b border-zinc-800 pb-2">
    <Icon className="w-5 h-5 text-rose-500" />
    <h2 className="text-sm font-mono tracking-[0.2em] text-zinc-100 uppercase">{title}</h2>
  </div>
);

const TechCard = ({ title, value, label }: { title: string; value: string; label: string }) => (
  <div className="bg-zinc-900/30 border border-zinc-800 p-4 flex flex-col justify-between hover:border-rose-500/30 transition-colors duration-300">
    <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{title}</span>
    <div className="mt-2">
      <span className="text-2xl md:text-3xl font-bold text-zinc-100">{value}</span>
      <span className="text-xs text-rose-500 ml-1">{label}</span>
    </div>
  </div>
);

const SpeedBar = ({ label, speed, width }: { label: string; speed: string; width: string }) => (
  <div className="mb-4">
    <div className="flex justify-between text-xs font-mono text-zinc-500 mb-1">
      <span>{label}</span>
      <span className="text-rose-400">{speed} WPM</span>
    </div>
    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: width }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-zinc-600 to-rose-500"
      />
    </div>
  </div>
);

const FeatureBlock = ({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="group flex flex-col gap-3 p-5 rounded-sm bg-zinc-900/20 border border-zinc-800/50 hover:bg-zinc-900/40 hover:border-rose-500/30 transition-all duration-300">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-zinc-800/50 rounded-sm text-zinc-300 group-hover:text-rose-500 group-hover:bg-rose-500/10 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">{title}</h3>
    </div>
    <p className="text-sm text-zinc-400 leading-relaxed pl-1">{children}</p>
  </div>
);

const ResonanceCard = ({
  icon: Icon,
  title,
  children,
  index,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className="relative group overflow-hidden bg-zinc-900/10 border-l-2 border-zinc-800 hover:border-rose-500/50 pl-6 py-4 pr-4 transition-all duration-500"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center gap-3 min-w-[240px]">
        <Icon className="w-5 h-5 text-rose-500/80 group-hover:text-rose-400 transition-colors" />
        <h3 className="text-lg text-zinc-200 tracking-wide group-hover:text-white transition-colors">
          {title}
        </h3>
      </div>
      <p className="text-sm text-zinc-400 font-light leading-relaxed group-hover:text-zinc-300 transition-colors">
        {children}
      </p>
    </div>
  </motion.div>
);

export default function RSVPLanding() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden selection:bg-rose-500/30">
      {/* --- Background --- */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Suspense fallback={null}>
            <StarField />
          </Suspense>
        </Canvas>
      </div>
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950 pointer-events-none z-10" />

      {/* --- Content --- */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 py-20">
        {/* Navigation */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-rose-500 transition-colors mb-16 uppercase tracking-widest group hover:cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to Archive
        </motion.button>

        {/* Hero Section */}
        <div className="grid md:grid-cols-[2fr_1fr] gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <ScanLine className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-bold tracking-[0.3em] opacity-80">
                PROTOCOL ANALYSIS
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-600 mb-6">
              R.S.V.P.
            </h1>
            <p className="text-lg text-zinc-300 font-light leading-relaxed border-l-2 border-rose-500/30 pl-4">
              <strong className="text-white font-medium">Rapid Serial Visual Presentation</strong>{" "}
              is a scientific method of displaying text sequentially in a fixed focal position to
              maximize cognitive throughput.
            </p>
          </motion.div>

          {/* Key Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 gap-2"
          >
            <TechCard title="Avg Efficiency" value="+58%" label="Increase" />
            <TechCard title="Saccade Latency" value="0" label="ms" />
          </motion.div>
        </div>

        {/* --- SECTION: SPIRITUAL IMMERSION --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <SectionHeading title="Scriptural Resonance" icon={Flame} />

          <div className="flex flex-col gap-4">
            <ResonanceCard icon={Heart} title="Undivided Devotion" index={0}>
              In a world of distraction, RSVP demands total engagement. It creates a{" "}
              <strong className="text-zinc-200">sanctuary of attention</strong>, locking your focus
              exclusively on the Word and silencing external noise.
            </ResonanceCard>

            <ResonanceCard icon={Zap} title="Flow State Access" index={1}>
              Bypass the friction of traditional reading to enter a meditative "flow" state
              instantly. By removing mechanical effort, the barrier between the text and your spirit
              dissolves.
            </ResonanceCard>

            <ResonanceCard icon={Eye} title="Macro-Narrative Vision" index={2}>
              Consume entire books in single sittings. Witness the sweeping arcs of biblical history
              unfold without fatigue, revealing connections often lost in fragmented study.
            </ResonanceCard>

            <ResonanceCard icon={BrainCircuit} title="Pure Reception" index={3}>
              Silence the analytical inner narrator. Receive scripture as a continuous stream of
              revelation—a "download" of truth that bypasses skepticism and reaches the heart.
            </ResonanceCard>
          </div>
        </motion.div>

        {/* --- SECTION 1: MECHANICS --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading title="System Mechanics" icon={Cpu} />

          <div className="grid md:grid-cols-2 gap-4">
            <FeatureBlock icon={Eye} title="Saccadic Elimination">
              Standard reading involves "saccades"—jerky eye movements that consume{" "}
              <strong className="text-zinc-200">~150ms</strong> per jump. RSVP eliminates this
              mechanical latency entirely by keeping the eye fixed.
            </FeatureBlock>

            <FeatureBlock icon={Target} title="Foveal Optimization">
              Human visual acuity is highest in the fovea (center 2° of vision). RSVP presents data
              directly to the fovea, bypassing the lower-resolution para-foveal processing required
              in page scanning.
            </FeatureBlock>

            <FeatureBlock icon={BrainCircuit} title="Cognitive Offloading">
              By removing the burden of spatial navigation (tracking lines), the brain reallocates
              resources to <strong className="text-zinc-200">decoding and synthesis</strong>,
              allowing for higher comprehension at speed.
            </FeatureBlock>

            <FeatureBlock icon={Zap} title="Subvocalization Suppression">
              At speeds above ~400 WPM, the "inner voice" cannot keep up. The brain switches to
              direct visual-conceptual processing, a state often described as "downloading"
              information.
            </FeatureBlock>
          </div>
        </motion.div>

        {/* --- SECTION 2: DATA & HISTORY --- */}
        <div className="grid md:grid-cols-2 gap-12 mt-8">
          {/* Benchmarks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <SectionHeading title="Velocity Benchmarks" icon={Activity} />
            <div className="bg-zinc-900/20 p-6 border border-zinc-800 rounded-sm">
              <SpeedBar label="Average Reader" speed="230" width="30%" />
              <SpeedBar label="College Level" speed="350" width="45%" />
              <SpeedBar label="RSVP (User)" speed="500" width="65%" />
              <SpeedBar label="RSVP (Expert)" speed="900+" width="100%" />
              <p className="mt-6 text-xs text-zinc-500 font-mono leading-tight">
                * Data based on visual cognition studies utilizing rapid serial presentation
                protocols.
              </p>
            </div>
          </motion.div>

          {/* Origins */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <SectionHeading title="Archival Context" icon={History} />
            <div className="prose prose-invert prose-sm text-zinc-400">
              <p>
                The protocol was first formalized in the 1970s by cognitive psychologist{" "}
                <strong className="text-zinc-200">Mary C. Potter</strong> at MIT.
              </p>
              <p className="mt-4">
                Her research demonstrated that the human brain can identify visual stimuli
                (words/images) in as little as{" "}
                <strong className="text-rose-400">13 milliseconds</strong>. The bottleneck in
                reading is not the brain's processing speed, but the eye's mechanical movement
                speed.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-600 border border-zinc-800 p-2 w-fit">
                <span>REF: Potter, M. C. (1976). Short-term conceptual memory.</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- SECTION 3: USER GUIDE --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8"
        >
          <SectionHeading title="Operational Directives" icon={Move} />

          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 text-rose-500 font-mono font-bold rounded-sm">
                01
              </div>
              <h3 className="font-bold text-zinc-200">Fixed Gaze</h3>
              <p className="text-sm text-zinc-500">
                Do not attempt to chase words. Relax your focus on the red center guides. Let the
                words wash over your vision.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 text-rose-500 font-mono font-bold rounded-sm">
                02
              </div>
              <h3 className="font-bold text-zinc-200">Blink Control</h3>
              <p className="text-sm text-zinc-500">
                Blink between paragraphs or chapters. The system will pause automatically if
                interaction is detected.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 text-rose-500 font-mono font-bold rounded-sm">
                03
              </div>
              <h3 className="font-bold text-zinc-200">Progressive Overload</h3>
              <p className="text-sm text-zinc-500">
                Begin at 300 WPM. Increase velocity by 50 WPM intervals as your cognitive comfort
                threshold adapts.
              </p>
            </div>
          </div>
        </motion.div>

        {/* --- FOOTER ACTION --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 pt-10 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-mono text-zinc-200 uppercase tracking-widest">
                System Ready
              </span>
            </div>
            <span className="text-xs text-zinc-600 mt-1">
              Awaiting user input for sequence initiation.
            </span>
          </div>

          <button
            onClick={() => router.push("/")}
            className="group relative px-8 py-4 bg-zinc-100 text-zinc-950 font-bold tracking-wide uppercase text-sm rounded-sm hover:bg-rose-500 hover:text-white transition-all duration-300 hover:cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              Select Volume <MousePointer2 className="w-4 h-4" />
            </span>
            <div className="absolute inset-0 bg-rose-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
