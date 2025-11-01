interface StylusProps {
  isPlaying: boolean;
  side: "left" | "right";
}

const Stylus = ({ isPlaying, side }: StylusProps) => {
  // Different positioning and rotation for left vs right deck
  const stylusConfig = side === "left" 
    ? {
        // Left deck: stylus comes from right side
        containerClass: "right-8 top-1/2 -translate-y-1/2",
        armRotation: isPlaying ? "rotate-[-25deg]" : "rotate-[15deg]",
        originClass: "origin-top-right"
      }
    : {
        // Right deck: stylus comes from left side
        containerClass: "left-8 top-1/2 -translate-y-1/2",
        armRotation: isPlaying ? "rotate-[-25deg]" : "rotate-[15deg]",
        originClass: "origin-top-left"
      };

  return (
    <div className={`absolute ${stylusConfig.containerClass} z-20`}>
      {/* Stylus arm pivot point */}
      <div className="relative">
        {/* Pivot base */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-gray-800 rounded-full shadow-lg"></div>
        
        {/* Stylus arm */}
        <div 
          className={`w-32 h-2 bg-gradient-to-r ${side === "left" ? "from-gray-700 to-gray-600" : "from-gray-600 to-gray-700"} rounded-full shadow-lg transition-transform duration-700 ${stylusConfig.originClass} ${stylusConfig.armRotation}`}
        >
          {/* Cartridge at the end */}
          <div className={`absolute ${side === "left" ? "right-0" : "left-0"} top-1/2 -translate-y-1/2 w-6 h-4 bg-gray-900 rounded-sm shadow-md`}>
            {/* Needle tip */}
            <div className={`absolute ${side === "left" ? "right-0" : "left-0"} top-1/2 -translate-y-1/2 w-2 h-0.5 bg-gray-400`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stylus;