/**
 * 学习反馈音效 — 使用 Web Audio API 生成，零外部资源
 * 答对 → 轻快的短促音，答错 → 低沉的短促音
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/** 答对音效 — 两声快速上升的叮咚 */
export function playKnowSound() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    // 第一声 880Hz
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(660, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    osc1.connect(gain);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // 第二声 1100Hz (稍高)
    const gain2 = ctx.createGain();
    gain2.connect(ctx.destination);
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1100, now + 0.1);
    osc2.connect(gain2);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.25);
  } catch {
    // 静默失败
  }
}

/** 答错音效 — 一声低沉短促的嗡 */
export function playUnknownSound() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch {
    // 静默失败
  }
}