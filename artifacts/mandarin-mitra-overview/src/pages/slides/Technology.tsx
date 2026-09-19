export default function Technology() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[7vw] py-[8vh] text-text">
      <div className="text-[1.5vw] uppercase tracking-[0.18em] text-primary">How it works today</div>
      <h1 className="mt-[2vh] font-display text-[5vw] leading-none">Local-first by design</h1>
      <div className="mt-[9vh] grid grid-cols-[1.1fr_0.9fr] gap-[7vw]">
        <div>
          <div className="border-b border-[#201f1d]/15 py-[2.2vh] text-[2.4vw]"><span className="mr-[2vw] text-primary">01</span>React + TypeScript + Vite</div>
          <div className="border-b border-[#201f1d]/15 py-[2.2vh] text-[2.4vw]"><span className="mr-[2vw] text-primary">02</span>Progress in localStorage</div>
          <div className="border-b border-[#201f1d]/15 py-[2.2vh] text-[2.4vw]"><span className="mr-[2vw] text-primary">03</span>On-device structural grading</div>
          <div className="py-[2.2vh] text-[2.4vw]"><span className="mr-[2vw] text-primary">04</span>Browser speech APIs</div>
        </div>
        <div className="bg-[#1b1a19] p-[3vw] text-[#ece8e3]">
          <div className="text-[1.6vw] uppercase tracking-[0.14em] text-[#dcae68]">Architecture principle</div>
          <p className="mt-[3vh] font-display text-[3.4vw] leading-[1.2]">Local stand-ins sit behind clear interfaces.</p>
          <p className="mt-[3vh] text-[2vw] leading-[1.45] text-[#ece8e3]/70">Hosted grading, native speech, and server accounts can replace them later without rebuilding the learning UI.</p>
        </div>
      </div>
    </div>
  );
}