export default function Features() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[7vw] py-[7vh] text-text">
      <div className="text-[1.5vw] uppercase tracking-[0.18em] text-primary">What the MVP includes</div>
      <h1 className="mt-[2vh] font-display text-[4.7vw] leading-none">A complete practice system</h1>
      <div className="mt-[6vh] grid grid-cols-3 gap-[2.2vw]">
        <div className="bg-[#eae9e9] p-[2.4vw]"><div className="font-display text-[2.8vw]">Onboarding</div><p className="mt-[1.5vh] text-[2vw] leading-[1.35] text-muted">Adaptive placement, skippable and resumable</p></div>
        <div className="bg-[#eae9e9] p-[2.4vw]"><div className="font-display text-[2.8vw]">Sentence Forge</div><p className="mt-[1.5vh] text-[2vw] leading-[1.35] text-muted">Six ladder drills plus sentence joining</p></div>
        <div className="bg-[#eae9e9] p-[2.4vw]"><div className="font-display text-[2.8vw]">Two-step feedback</div><p className="mt-[1.5vh] text-[2vw] leading-[1.35] text-muted">A structural question before correction</p></div>
        <div className="bg-[#eae9e9] p-[2.4vw]"><div className="font-display text-[2.8vw]">Hindi bridge</div><p className="mt-[1.5vh] text-[2vw] leading-[1.35] text-muted">Composer, pinyin primer, mini-modules</p></div>
        <div className="bg-[#eae9e9] p-[2.4vw]"><div className="font-display text-[2.8vw]">Listening & review</div><p className="mt-[1.5vh] text-[2vw] leading-[1.35] text-muted">Tone pairs, minimal pairs, spaced review</p></div>
        <div className="bg-[#eae9e9] p-[2.4vw]"><div className="font-display text-[2.8vw]">Progress</div><p className="mt-[1.5vh] text-[2vw] leading-[1.35] text-muted">Error trends, pattern map, know vs. use</p></div>
      </div>
    </div>
  );
}