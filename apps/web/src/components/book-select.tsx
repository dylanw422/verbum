"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { WEB } from "@/public/WEB";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.cjs";
import { BookOpen, Database, ScanLine, Command } from "lucide-react";

// --- 3D Background: Warp Field ---

function StarField(props: any) {
  const ref = useRef<any>(null);
  const [sphere] = useState(
    () => random.inSphere(new Float32Array(6000), { radius: 1.5 }) as Float32Array
  );

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
    const t = state.clock.getElapsedTime();
    ref.current.scale.setScalar(1 + Math.sin(t / 2) * 0.05);
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
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

// --- Logic ---

const BOOKS = Object.keys(WEB);
const OT_BOOKS = BOOKS.slice(0, 39);
const NT_BOOKS = BOOKS.slice(39);

// --- Components ---

const SectionHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div className="flex items-center gap-3 mb-6 mt-8 border-b border-rose-500/20 pb-2">
    <div className="p-1.5 bg-rose-500/10 rounded-md">
      <Icon className="w-4 h-4 text-rose-500" />
    </div>
    <h2 className="text-lg font-mono tracking-[0.2em] text-zinc-100 uppercase">{title}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-rose-500/50 to-transparent" />
  </div>
);

const BookCard = ({ book, index, router }: { book: string; index: number; router: any }) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.4,
          delay: index * 0.01,
          ease: "easeOut",
        },
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.15, ease: "circOut" },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/${book.replaceAll(" ", "-")}`)}
      className="will-change-transform group relative flex flex-col items-start justify-between p-4 h-24 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-sm hover:border-rose-500/50 hover:bg-rose-500/10 transition-colors duration-200 text-left overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-700 group-hover:border-rose-500 transition-colors duration-200" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-700 group-hover:border-rose-500 transition-colors duration-200" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-500/10 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-500 ease-in-out pointer-events-none" />

      <span className="text-xs font-mono text-zinc-600 group-hover:text-rose-400 transition-colors duration-200">
        REF_{String(index + 1).padStart(2, "0")}
      </span>

      <div className="w-full">
        <h3 className="text-sm font-bold text-zinc-300 group-hover:text-white uppercase tracking-wider truncate transition-colors duration-200">
          {book}
        </h3>
        <div className="w-full h-px bg-zinc-800 mt-2 group-hover:bg-rose-500/30 transition-colors duration-200" />
      </div>
    </motion.button>
  );
};

export default function BookSelect() {
  const router = useRouter();
  const scrollRef = useRef(null);

  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-950 text-zinc-100 font-sans selection:bg-rose-500/30 overflow-hidden">
      {/* --- 3D Background Layer --- */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <StarField />
          </Suspense>
        </Canvas>
      </div>

      {/* --- Overlay Texture --- */}
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 pointer-events-none z-10" />

      {/* --- Main Scrollable Content --- */}
      <div
        ref={scrollRef}
        className="relative z-20 w-full h-full overflow-y-auto scrollbar-hide px-4 md:px-12 py-12"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-7xl mx-auto pb-20">
          {/* --- VERBUM HEADER --- */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex items-center justify-between mb-16 pt-2 select-none"
          >
            <div className="flex items-center gap-4 group">
              {/* Logo Mark */}
              <div className="w-10 h-10 bg-rose-500 flex items-center justify-center text-zinc-950 font-bold text-xl rounded-sm shadow-[0_0_15px_rgba(244,63,94,0.4)] group-hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] transition-shadow duration-300">
                <Command className="w-5 h-5" />
              </div>
              {/* Logo Text */}
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight leading-none text-zinc-100 group-hover:text-rose-500 transition-colors duration-300">
                  VERBUM
                </span>
                <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase group-hover:text-rose-500/70 transition-colors duration-300">
                  Scripture Engine
                </span>
              </div>
            </div>

            {/* Version / Date Stamp */}
            <div className="hidden sm:block text-right">
              <div className="text-[10px] font-mono text-zinc-600 tracking-widest">
                BUILD_2024.1
              </div>
            </div>
          </motion.div>

          {/* Main Title Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-2 mb-12"
          >
            <div className="flex items-center gap-2 text-rose-500">
              <Database className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold tracking-[0.3em] opacity-80">SYSTEM READY</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-600">
              THE ARCHIVE
            </h1>
            <p className="text-zinc-500 font-mono text-sm max-w-md border-l-2 border-rose-500/30 pl-4 mt-2 leading-relaxed">
              Select a volume to initiate rapid serial visual presentation protocol.{" "}
              <a
                href="/rsvp"
                className="inline-block border-b border-zinc-700 text-zinc-400 hover:text-rose-500 hover:border-rose-500 transition-colors duration-200"
              >
                What is RSVP? ↗
              </a>
            </p>
          </motion.div>

          {/* Old Testament Grid */}
          <div>
            <SectionHeader title="Old Testament" icon={BookOpen} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {OT_BOOKS.map((book, i) => (
                <BookCard key={book} book={book} index={i} router={router} />
              ))}
            </div>

            {/* New Testament Grid */}
            <SectionHeader title="New Testament" icon={ScanLine} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {NT_BOOKS.map((book, i) => (
                <BookCard key={book} book={book} index={i + 39} router={router} />
              ))}
            </div>
          </div>

          {/* Footer Decorative */}
          <div className="mt-20 flex justify-center opacity-30">
            <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase">
              <span>Verbum V1.0</span>
              <span className="w-1 h-1 bg-rose-500 rounded-full" />
              <span>Rendered in Realtime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
