'use client';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-slate-200">
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Geometric 3D-like Animation */}
        <div className="relative w-20 h-20 flex items-center justify-center mb-10">
          {/* Outer rotating square */}
          <div className="absolute w-full h-full border border-blue-500/30 rounded-xl animate-[spin_4s_linear_infinite]"></div>
          {/* Middle rotating square (reverse) */}
          <div className="absolute w-14 h-14 border border-orange-500/50 rounded-lg animate-[spin_3s_linear_infinite_reverse]"></div>
          {/* Inner rotating square */}
          <div className="absolute w-8 h-8 border border-blue-400/80 rounded-md animate-[spin_2s_linear_infinite]"></div>
          {/* Core dot */}
          <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_#fff] animate-pulse"></div>
        </div>

        {/* Text */}
        <h2 className="text-2xl md:text-3xl font-light tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-slate-200 to-orange-400 animate-pulse text-center px-4">
          Welcome to Anshveer's Portfolio
        </h2>
        
        <p className="mt-4 text-xs tracking-[0.4em] text-slate-500 uppercase font-bold">
          Preparing 3D Engine
        </p>

        {/* Minimal Progress Line */}
        <div className="mt-8 w-48 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-50"></div>
      </div>
    </div>
  );
}
