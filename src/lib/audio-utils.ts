
/**
 * Procedural audio utility to play a soft click sound.
 * Uses Web Audio API to avoid external assets and hydration issues.
 */
export const playClickSound = () => {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Soft sine wave for a clean "pop" sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);

    // Fade out quickly to make it a click
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);

    // Close context after playing to save resources
    setTimeout(() => {
      if (audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    }, 200);
  } catch (error) {
    // Fail silently if audio is blocked or unsupported
  }
};
