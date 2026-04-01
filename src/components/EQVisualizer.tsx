import { useEffect, useRef } from "react";

interface EQVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
}

const BAR_COUNT = 20;
const DOT_ROWS = 8;

function getBinIndices(bufferLength: number): number[] {
  const min = 1;
  const max = Math.floor(bufferLength * 0.6);
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const t = i / (BAR_COUNT - 1);
    return Math.round(min + (max - min) * Math.pow(t, 1.6));
  });
}

const EQVisualizer = ({ isPlaying, audioRef }: EQVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const dataRef = useRef<Uint8Array>(new Uint8Array(128));
  const binIndicesRef = useRef<number[]>([]);

  // Attach to the audio element's "play" event so the AudioContext is
  // created during the browser's user-gesture chain — avoiding autoplay suspension.
  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const initAnalyser = () => {
      if (sourceRef.current) {
        // Already connected — just resume if suspended
        ctxRef.current?.resume();
        return;
      }
      try {
        const ac = new AudioContext();
        const analyser = ac.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.45;
        const source = ac.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ac.destination);
        ctxRef.current = ac;
        analyserRef.current = analyser;
        sourceRef.current = source;
        dataRef.current = new Uint8Array(analyser.frequencyBinCount);
        binIndicesRef.current = getBinIndices(analyser.frequencyBinCount);
        // Resume in case the context was created suspended
        ac.resume();
      } catch {
        // CORS or other error — fall back to static visualizer, audio unaffected
        ctxRef.current = null;
      }
    };

    audio.addEventListener("play", initAnalyser);
    return () => audio.removeEventListener("play", initAnalyser);
  }, [audioRef]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const AMBER = "#E8A020";
    const AMBER_GLOW = "rgba(232,160,32,0.85)";
    const DIM = "rgba(200,196,190,0.35)";

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      let levels: number[];

      if (isPlaying && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataRef.current);
        levels = binIndicesRef.current.map((bin) => {
          const pct = dataRef.current[bin] / 255;
          return Math.round(pct * DOT_ROWS);
        });
      } else {
        levels = Array(BAR_COUNT).fill(0);
      }

      const slotW = w / BAR_COUNT;
      const dotD = Math.min(slotW * 0.55, (h / DOT_ROWS) * 0.62);
      const colX = (i: number) => i * slotW + slotW / 2;
      const rowY = (row: number) => h - (row + 0.5) * (h / DOT_ROWS);

      for (let col = 0; col < BAR_COUNT; col++) {
        const active = levels[col];
        for (let row = 0; row < DOT_ROWS; row++) {
          const x = colX(col);
          const y = rowY(row);
          const lit = row < active;

          ctx.beginPath();
          ctx.arc(x, y, dotD / 2, 0, Math.PI * 2);

          if (lit) {
            if (row === active - 1 && active > 0) {
              ctx.fillStyle = AMBER_GLOW;
              ctx.shadowColor = "#E8A020";
              ctx.shadowBlur = 6;
            } else {
              ctx.fillStyle = AMBER;
              ctx.shadowBlur = 0;
            }
          } else {
            ctx.fillStyle = DIM;
            ctx.shadowBlur = 0;
          }
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <canvas
        ref={canvasRef}
        width={200}
        height={64}
        className="w-full"
        style={{ height: "64px" }}
      />
      <div className="flex justify-between w-full px-1">
        {["60", "250", "1k", "4k", "16k"].map((label) => (
          <span key={label} style={{ fontSize: "8px", color: "#B8B4AE", fontFamily: "monospace" }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EQVisualizer;
