class AudioService {
  private context?: AudioContext;
  async unlock() {
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') await this.context.resume();
    } catch { /* Audio is optional, including on iOS. */ }
  }
  collect(enabled: boolean) {
    if (!enabled || !this.context || this.context.state !== 'running') return;
    const ctx = this.context;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(660, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    oscillator.connect(gain); gain.connect(ctx.destination);
    oscillator.start(); oscillator.stop(ctx.currentTime + 0.22);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  suspend() { void this.context?.suspend().catch(() => {}); }
}
export const audioService = new AudioService();
