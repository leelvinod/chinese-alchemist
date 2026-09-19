export default function Audience() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[7vw] py-[8vh] text-text">
      <div className="text-[1.5vw] uppercase tracking-[0.18em] text-primary">Built for Indian learners</div>
      <h1 className="mt-[2vh] font-display text-[5vw] leading-none">One destination. Two bridges.</h1>
      <div className="mt-[9vh] grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-[2vw]">
        <div className="border-t-[0.7vh] border-[#8a6222] pt-[3vh]">
          <div className="font-display text-[4vw]">English</div>
          <p className="mt-[2vh] text-[2vw] leading-[1.4] text-muted">Primary teaching language</p>
        </div>
        <div className="text-[3vw] text-[#8a6222]">→</div>
        <div className="border-t-[0.7vh] border-[#b68235] pt-[3vh]">
          <div className="font-display text-[4vw]">हिन्दी</div>
          <p className="mt-[2vh] text-[2vw] leading-[1.4] text-muted">Bridge for transfer patterns</p>
        </div>
        <div className="text-[3vw] text-[#8a6222]">→</div>
        <div className="border-t-[0.7vh] border-[#885f90] pt-[3vh]">
          <div className="font-display text-[4vw] font-semibold" style={{fontFamily:"'Noto Sans SC', sans-serif"}}>中文</div>
          <p className="mt-[2vh] text-[2vw] leading-[1.4] text-muted">Simplified Mandarin</p>
        </div>
      </div>
      <div className="absolute bottom-[8vh] left-[7vw] right-[7vw] bg-[#eae9e9] px-[3vw] py-[3vh] text-[2vw] leading-[1.45]">HSK 1–4 is the intended product scope. The current MVP contains a smaller launch set for testing the full learning system.</div>
    </div>
  );
}