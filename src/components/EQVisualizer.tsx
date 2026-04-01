import { useEffect, useRef } from "react";

interface EQVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
}

const BAR_COUNT = 20;
const FREQ_LABELS = ["60", "250", "1k", "4k", "16k"];

// Each bar has a current height (0–1), a spring target, and velocity
interface Bar { h: number; target: number; vel: number }

function randomTarget(i: number) {
  // Shape the curve: louder in the mids, quieter at extremes
  const mid = BAR_COUNT / 2;
  const bias = 1 - Math.abs(i - mid) / mid * 0.5;
  return (0.15 + Math.random() * 0.85) * bias;
}

const EQVisualizer = ({ isPlaying }: EQVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<Bar[]>(
    Array.from({ length: BAR_COUNT }, (_, i) => ({
      h: 0.05,
      target: randomTarget(i),
      vel: 0,
    }))
  );
  const isPlayingRef = useRef(isPlaying);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const playing = isPlayingRef.current;
      const barSlot = W / BAR_COUNT;
      const gap = barSlot * 0.4;
      const barW = barSlot - gap;
      const dotH = 3;
      const dotGap = 2;
      const step = dotH + dotGap;

      barsRef.current.forEach((bar, i) => {
        if (playing) {
          bar.vel += (bar.target - bar.h) * 0.1;
          bar.vel *= 0.72;
          bar.h = Math.max(0.04, Math.min(1, bar.h + bar.vel));
          if (Math.random() < 0.04) bar.target = randomTarget(i);
        } else {
          bar.h += (0.04 - bar.h) * 0.08;
        }

        const barH = bar.h * H;
        const x = i * barSlot + gap / 2;
        const numDots = Math.floor(barH / step);

        for (let d = 0; d < numDots; d++) {
          // Warm amber gradient: deep amber at bottom, bright gold at top
          const ratio = d / Math.max(numDots - 1, 1);
          const g = Math.round(160 + ratio * 56);
          ctx.fillStyle = playing
            ? `rgba(232,${g},32,${0.7 + ratio * 0.3})`
            : `rgba(184,180,174,0.45)`;
          ctx.fillRect(x, H - (d + 1) * step, barW, dotH);
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <canvas
        ref={canvasRef}
        width={400}
        height={64}
        style={{ width: "100%", height: "64px", display: "block" }}
      />
      <div className="flex justify-between w-full px-1">
        {FREQ_LABELS.map((label) => (
          <span key={label} style={{ fontSize: "8px", color: "#B8B4AE", fontFamily: "monospace" }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EQVisualizer;
