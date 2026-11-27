// A short two-tone beep, generated in the browser (no audio file to load).
// Plays when a chat newly becomes urgent, so it is noticed even when nobody
// is looking at the list. Browsers allow it after the counselor's first click
// (the login), which always happens first.

let context: AudioContext | null = null;

export function playUrgentAlert(): void {
  try {
    context ??= new AudioContext();
    const start = context.currentTime;
    [880, 660, 880].forEach((frequency, i) => {
      if (!context) return;
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.18, start + i * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, start + i * 0.22 + 0.2);
      osc.connect(gain).connect(context.destination);
      osc.start(start + i * 0.22);
      osc.stop(start + i * 0.22 + 0.2);
    });
  } catch {
    // No audio available (blocked or unsupported): the red badge still shows.
  }
}
