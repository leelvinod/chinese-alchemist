const base = import.meta.env.BASE_URL;

export default function Opening() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1b1a19] text-[#ece8e3]">
      <img src={`${base}hero.jpg`} crossOrigin="anonymous" alt="Language learning notebook" className="absolute inset-0 h-full w-full object-cover opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1b1a19] via-[#1b1a19]/90 to-[#1b1a19]/20" />
      <div className="absolute left-[6vw] top-[8vh] text-[1.5vw] uppercase tracking-[0.22em] text-[#dcae68]">Mandarin for Indian learners</div>
      <div className="absolute left-[6vw] top-[23vh] w-[55vw]">
        <h1 className="font-display text-[7vw] leading-[0.9] tracking-tight">Mandarin Mitra</h1>
        <p className="mt-[4vh] w-[48vw] text-[2.8vw] leading-[1.25] text-[#ece8e3]/90">Speak Chinese in the right order, three minutes a day.</p>
      </div>
      <div className="absolute bottom-[8vh] left-[6vw] flex items-center gap-[1.5vw] text-[1.7vw] text-[#ece8e3]/75">
        <span className="border-b-[0.3vh] border-[#c66c5a] pb-[0.5vh]">我</span>
        <span className="border-b-[0.5vh] border-double border-[#b08a43] pb-[0.5vh]">明天</span>
        <span className="border-b-[0.35vh] border-dotted border-[#46876c] pb-[0.5vh]">在家</span>
        <span className="border-b-[0.65vh] border-[#885f90] pb-[0.5vh]">吃</span>
        <span className="border-b-[0.4vh] border-[#567aa1] pb-[0.5vh]">饭</span>
      </div>
    </div>
  );
}