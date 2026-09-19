export default function NextSteps() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1b1a19] px-[7vw] py-[8vh] text-[#ece8e3]">
      <div className="text-[1.5vw] uppercase tracking-[0.18em] text-[#dcae68]">Proposed next steps</div>
      <h1 className="mt-[2vh] w-[70vw] font-display text-[5vw] leading-none">From learning-system MVP to launch-ready product</h1>
      <div className="mt-[9vh] grid grid-cols-3 gap-[3vw]">
        <div><div className="font-display text-[5.5vw] text-[#dcae68]">01</div><div className="mt-[1vh] font-display text-[2.8vw]">Expand content</div><p className="mt-[2vh] text-[2vw] leading-[1.4] text-[#ece8e3]/68">Grow patterns, vocabulary, and error coverage toward HSK 1–4.</p></div>
        <div><div className="font-display text-[5.5vw] text-[#dcae68]">02</div><div className="mt-[1vh] font-display text-[2.8vw]">Add real services</div><p className="mt-[2vh] text-[2vw] leading-[1.4] text-[#ece8e3]/68">Production accounts, synced progress, grading, and checkout.</p></div>
        <div><div className="font-display text-[5.5vw] text-[#dcae68]">03</div><div className="mt-[1vh] font-display text-[2.8vw]">Package for Android</div><p className="mt-[2vh] text-[2vw] leading-[1.4] text-[#ece8e3]/68">Wrap the web app, add native speech, and support notifications.</p></div>
      </div>
      <div className="absolute bottom-[6vh] right-[7vw] font-display text-[2.4vw] text-[#dcae68]">Mandarin Mitra</div>
    </div>
  );
}