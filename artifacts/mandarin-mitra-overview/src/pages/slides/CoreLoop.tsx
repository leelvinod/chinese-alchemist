export default function CoreLoop() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1b1a19] px-[7vw] py-[8vh] text-[#ece8e3]">
      <div className="text-[1.5vw] uppercase tracking-[0.18em] text-[#dcae68]">The three-minute learning loop</div>
      <h1 className="mt-[2vh] font-display text-[5vw] leading-none">Build. Correct. Strengthen.</h1>
      <div className="mt-[10vh] grid grid-cols-4 gap-[2.2vw]">
        <div className="border-t-[0.55vh] border-[#c66c5a] pt-[3vh]"><div className="text-[1.6vw] text-[#dcae68]">01</div><div className="mt-[1.5vh] font-display text-[3vw]">Open</div><p className="mt-[2vh] text-[2vw] leading-[1.4] text-[#ece8e3]/70">Start a focused three-minute session.</p></div>
        <div className="border-t-[0.55vh] border-[#b08a43] pt-[3vh]"><div className="text-[1.6vw] text-[#dcae68]">02</div><div className="mt-[1.5vh] font-display text-[3vw]">Build or say</div><p className="mt-[2vh] text-[2vw] leading-[1.4] text-[#ece8e3]/70">Produce one Chinese sentence.</p></div>
        <div className="border-t-[0.55vh] border-[#46876c] pt-[3vh]"><div className="text-[1.6vw] text-[#dcae68]">03</div><div className="mt-[1.5vh] font-display text-[3vw]">Correct</div><p className="mt-[2vh] text-[2vw] leading-[1.4] text-[#ece8e3]/70">Receive a question first, then the answer.</p></div>
        <div className="border-t-[0.55vh] border-[#885f90] pt-[3vh]"><div className="text-[1.6vw] text-[#dcae68]">04</div><div className="mt-[1.5vh] font-display text-[3vw]">Adapt</div><p className="mt-[2vh] text-[2vw] leading-[1.4] text-[#ece8e3]/70">Revisit weak patterns more often.</p></div>
      </div>
    </div>
  );
}