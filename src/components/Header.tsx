import type { HeaderProps } from "../config/interfaces";


// Extracted Header component
export function Header({ playerNation, globalResources, currentDate, goToMenu }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
        <h1 className="font-black italic tracking-tighter text-xl uppercase">
          {playerNation.name}
        </h1>
      </div>
      <div className="flex items-center gap-12">
        {/* Pannello Risorse */}
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase">
            Budget Disp.
          </span>
          <span className="text-3xl font-black text-yellow-400">
            {globalResources}
            <span className="text-sm ml-1 text-yellow-600">PR</span>
          </span>
        </div>
      </div>
      <div className="flex gap-8 text-sm font-mono">
        <div>
          DATA:{" "}
          <span className="text-cyan-400">
            {currentDate.toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div>
          MINACCIA:{" "}
          <span className="text-red-900 font-bold underline">LIVELLO 1</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          className="bg-red-900 px-3 py-1 rounded text-m"
          onClick={goToMenu}
        >
          Esci
        </button>
      </div>
    </header>
  );
}