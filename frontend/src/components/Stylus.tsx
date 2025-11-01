interface StylusProps {
  isPlaying: boolean;
  side: "left" | "right";
}

const Stylus = ({ isPlaying, side }: StylusProps) => {
  // When not playing: 0deg (straight down)
  // When playing: -45deg for left, 45deg for right (needle touches disk)
  const rotation = isPlaying ? (side === "left" ? -45 : 45) : 0;
  
  return (
    <div className={`absolute top-8 ${side === "left" ? "right-8" : "left-8"}`}>
      <div className="relative w-40 h-2">
        {/* Arm base (top circle) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full shadow-lg z-10"></div>
        
        {/* Arm stick */}
        <div 
          className="absolute right-5 top-1/2 -translate-y-1/2 w-32 h-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-lg origin-right transition-transform duration-500"
          style={{ transform: `translateY(-50%) rotate(${rotation}deg)` }}
        >
          {/* Needle head (bottom circle) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full shadow-md">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stylus;