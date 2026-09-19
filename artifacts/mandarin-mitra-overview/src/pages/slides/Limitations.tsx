export default function Limitations() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg px-[7vw] py-[7vh] text-text">
      <div className="text-[1.5vw] uppercase tracking-[0.18em] text-primary">Current MVP boundaries</div>
      <h1 className="mt-[2vh] font-display text-[4.7vw] leading-none">Working product, deliberate substitutes</h1>
      <div className="mt-[6vh] grid grid-cols-2 gap-x-[5vw] gap-y-[4vh]">
        <div className="border-t-[0.5vh] border-[#a06f24] pt-[2.3vh]"><div className="font-display text-[2.8vw]">Accounts</div><p className="mt-[1vh] text-[2vw] leading-[1.35] text-muted">Name and phone are stored locally; no OTP or production identity system.</p></div>
        <div className="border-t-[0.5vh] border-[#a06f24] pt-[2.3vh]"><div className="font-display text-[2.8vw]">Payment</div><p className="mt-[1vh] text-[2vw] leading-[1.35] text-muted">The paywall simulates entitlement; no checkout provider is connected.</p></div>
        <div className="border-t-[0.5vh] border-[#a06f24] pt-[2.3vh]"><div className="font-display text-[2.8vw]">Content</div><p className="mt-[1vh] text-[2vw] leading-[1.35] text-muted">Eight patterns and twenty words demonstrate the system, not full HSK coverage.</p></div>
        <div className="border-t-[0.5vh] border-[#a06f24] pt-[2.3vh]"><div className="font-display text-[2.8vw]">Native features</div><p className="mt-[1vh] text-[2vw] leading-[1.35] text-muted">Speech depends on browser support; Android answer-in-notification is not built.</p></div>
      </div>
    </div>
  );
}