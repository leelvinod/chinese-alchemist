export default function Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[7vw] py-[8vh] text-text">
      <div className="absolute right-[-8vw] top-[-15vh] h-[45vh] w-[45vh] rounded-full border-[1.8vw] border-[#b68235]/10" />
      <div className="text-[1.5vw] uppercase tracking-[0.18em] text-primary">The learner problem</div>
      <h1 className="mt-[2vh] w-[72vw] font-display text-[4.8vw] leading-[1.02]">Knowing words is not the same as building a sentence.</h1>
      <div className="mt-[8vh] grid grid-cols-2 gap-[6vw]">
        <div>
          <div className="font-display text-[3vw] text-[#8a6222]">Mandarin word order</div>
          <p className="mt-[2vh] text-[2.15vw] leading-[1.5] text-muted">Time, place, manner, verb, and object each have a job—and the order matters.</p>
        </div>
        <div>
          <div className="font-display text-[3vw] text-[#8a6222]">Hindi transfer</div>
          <p className="mt-[2vh] text-[2.15vw] leading-[1.5] text-muted">Familiar habits can carry over, including the tendency to place the verb at the end.</p>
        </div>
      </div>
      <div className="absolute bottom-[7vh] left-[7vw] right-[7vw] border-t border-[#201f1d]/15 pt-[3vh] text-[2vw]">The MVP teaches sentence structure as a visible, repeatable system.</div>
    </div>
  );
}