import { useEffect, useState } from "react";
import { Headphones, Music, Loader2, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onPlaylistImport: (url: string) => void;
  isImporting?: boolean;
  playlistTitle?: string;
  playlistImage?: string;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onSkip?: () => void;
  onPrevious?: () => void;
}

const Header = ({
  onPlaylistImport,
  isImporting = false,
  playlistTitle,
  playlistImage,
  isPlaying = false,
  onPlayPause,
  onSkip,
  onPrevious,
}: HeaderProps) => {
  const hasPlaylist = Boolean(playlistTitle);

  // Collapse the input bar when a playlist loads; clicking it re-expands
  const [inputExpanded, setInputExpanded] = useState(true);

  useEffect(() => {
    if (hasPlaylist) setInputExpanded(false);
  }, [hasPlaylist]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get("playlistUrl") as string;
    if (url && !isImporting) {
      onPlaylistImport(url);
      e.currentTarget.reset();
      // Collapse again after submitting a new URL
      if (hasPlaylist) setInputExpanded(false);
    }
  };

  return (
    <header className="backdrop-blur-sm sticky top-0 z-50" style={{ background: "rgba(236,234,230,0.92)", borderBottom: "1px solid #D0CCC6" }}>
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="grid grid-cols-[auto_1fr] items-center gap-3 md:gap-6">
          {/* DJ Logo */}
          <div className="flex items-center">
            <img
              src="/djae-logo.png"
              alt="DJAE Logo"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>

          {/* URL input + player pill */}
          <div className="flex items-center justify-center gap-3 md:gap-4">

            {/* Animated input bar */}
            <div
              className="transition-all duration-500 ease-in-out overflow-hidden"
              style={{ maxWidth: inputExpanded ? "487px" : "122px", width: "100%" }}
            >
              {inputExpanded ? (
                <form onSubmit={handleSubmit}>
                  <div className="relative flex items-center">
                    <Headphones className="absolute left-4 md:left-5 w-5 h-5 md:w-6 md:h-6 text-gray-400 z-10" />
                    <Input
                      type="text"
                      name="playlistUrl"
                      placeholder="Paste a playlist link"
                      disabled={isImporting}
                      autoFocus={hasPlaylist}
                      className="w-full pl-12 md:pl-14 pr-12 md:pr-14 py-5 md:py-6 bg-gray-100 border-none text-gray-800 placeholder:text-gray-400 rounded-full text-sm md:text-base shadow-neumorphic-inset focus:shadow-neumorphic-inset focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-60"
                    />
                    <Button
                      type="submit"
                      disabled={isImporting}
                      className="absolute right-2 md:right-3 w-[30px] h-[30px] bg-gray-900 hover:bg-gray-800 text-white rounded-full p-0 flex items-center justify-center shadow-lg group disabled:opacity-60"
                    >
                      {isImporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <img
                          src="/disk-icon.png"
                          alt="Submit"
                          className="w-5 h-5 group-hover:animate-spin"
                        />
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                /* Collapsed — click to expand */
                <button
                  onClick={() => setInputExpanded(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 h-[46px] bg-gray-100 rounded-full shadow-neumorphic-inset hover:bg-gray-200 transition-colors group"
                  title="Paste a new playlist link"
                >
                  <Headphones className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-gray-600 transition-colors" />
                  <span className="text-gray-400 text-sm truncate group-hover:text-gray-600 transition-colors">
                    New link…
                  </span>
                </button>
              )}
            </div>

            {/* Compact player pill */}
            <div className="hidden lg:flex items-center h-[44px] bg-white border-2 border-gray-200 rounded-full shadow-sm overflow-hidden flex-shrink-0">
              {hasPlaylist ? (
                <>
                  {/* Album art */}
                  <div className="w-[38px] h-[38px] ml-[2px] rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                    {playlistImage ? (
                      <img src={playlistImage} alt={playlistTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <span className="text-gray-800 text-sm font-semibold whitespace-nowrap px-3 max-w-[140px] truncate">
                    {playlistTitle}
                  </span>

                  {/* Divider */}
                  <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

                  {/* Controls */}
                  <div className="flex items-center gap-0.5 px-2">
                    <button
                      onClick={onPrevious}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <SkipBack className="w-3.5 h-3.5 text-gray-700" fill="currentColor" />
                    </button>

                    <button
                      onClick={onPlayPause}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 hover:bg-gray-700 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 text-white" fill="currentColor" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" />
                      )}
                    </button>

                    <button
                      onClick={onSkip}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <SkipForward className="w-3.5 h-3.5 text-gray-700" fill="currentColor" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 pl-2 pr-4 border-2 border-dashed border-gray-300 rounded-full h-full -m-0.5">
                  <div className="w-[30px] h-[30px] rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Music className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-gray-400 text-sm font-medium whitespace-nowrap">
                    Your playlist
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
