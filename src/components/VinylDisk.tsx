interface VinylDiskProps {
  isPlaying: boolean;
}

const VinylDisk = ({ isPlaying }: VinylDiskProps) => {
  return (
    <div className="relative w-72 h-72 mx-auto">
      {/* Entire platter spins when playing */}
      <div
        className="absolute inset-0 rounded-full"
        style={isPlaying ? { animation: "spin 3s linear infinite" } : undefined}
      >
        {/* Platter body — monochromatic */}
        <div
          className="absolute inset-0 rounded-full shadow-2xl"
          style={{ background: "radial-gradient(circle at 38% 36%, #4a4a4a, #1a1a1a)" }}
        >
          {/* Grooves */}
          {[3, 6, 9, 12, 16, 20].map((inset) => (
            <div
              key={inset}
              className="absolute rounded-full border"
              style={{
                inset: `${inset * 4}px`,
                borderColor: "rgba(255,255,255,0.06)",
              }}
            />
          ))}

          {/* Center label — flat grey with DJAE mark */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-inner"
            style={{ background: "#DEDBD6", border: "3px solid #1a1a1a" }}
          >
            {/* Spindle hole */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
              style={{ background: "#1a1a1a" }}
            />
            {/* DJAE wordmark */}
            <span
              className="font-bold tracking-widest select-none"
              style={{ fontSize: "11px", color: "#5C584F", letterSpacing: "0.2em" }}
            >
              DJAE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VinylDisk;
