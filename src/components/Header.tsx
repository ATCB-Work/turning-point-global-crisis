import type { HeaderProps } from "../config/interfaces";


// Extracted Header component
export function Header({ playerNation, vaccineProgress, mutationPoints, currentDate, goToMenu }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center gap-8 px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
        <h1 className="font-black italic tracking-tighter text-xl uppercase">
          {playerNation.name}
        </h1>
      </div>
      <div className="flex items-center gap-8">
        {/* Pannello Risorse */}
        {
          playerNation.player?.isVirus ? (
            <>
              <div className="flex flex-col items-center min-w-[120px]">
                <span className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase">
                  Punti Mutazione
                </span>
                <span className="text-3xl font-black text-yellow-400">
                  {mutationPoints}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase">
                  Fondi Pubblici
                </span>
                <span className="text-3xl font-black text-yellow-400">
                  {playerNation.resources.money}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase">
                  Stabilità
                </span>
                <span className="text-3xl font-black text-yellow-400">
                  {playerNation.resources.stability}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase">
                  Sanità
                </span>
                <span className="text-3xl font-black text-yellow-400">
                  {playerNation.resources.healthcare}
                </span>
              </div>
            </>
          )
        }
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase">
            Vaccino
          </span>
          <span className="text-3xl font-black text-yellow-400">
            {vaccineProgress}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-8 ml-auto text-sm font-mono">
        <div>
          DATA:&nbsp;
          <span className="text-cyan-400">
            {currentDate.toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          className="bg-red-900 hover:bg-red-700 px-3 py-1 rounded text-m cursor-pointer transition-all"
          onClick={goToMenu}
        >
          Esci
        </button>
      </div>
    </header>
  );
}