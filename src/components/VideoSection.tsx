import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if ((videoRef.current as any).webkitRequestFullscreen) {
      (videoRef.current as any).webkitRequestFullscreen();
    } else if ((videoRef.current as any).webkitEnterFullscreen) {
      // iOS Safari
      (videoRef.current as any).webkitEnterFullscreen();
    }
  };

  return (
    <section id="video-tour" className="py-24 px-4 bg-[#0D0D0F]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] text-sm tracking-[0.3em] uppercase mb-4 font-light">
            Video Tour / جولة مرئية
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-arabic">
            جولة مرئية
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-arabic">
            اكتشف ذا فيو أفينيو من خلال جولة مرئية حصرية تأخذك في رحلة داخل المشروع
          </p>
        </div>

        {/* Video Container */}
        <div
          ref={containerRef}
          className="relative group rounded-2xl overflow-hidden border border-[#D4AF37]/20 shadow-[0_0_60px_rgba(212,175,55,0.1)]"
        >
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover"
            src="/project-tour.mp4"
            playsInline
            onEnded={() => setIsPlaying(false)}
          />

          {/* Overlay Controls - يظهر فقط عند التمرير فوق الفيديو */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-[#D4AF37]/90 hover:bg-[#D4AF37] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-[0_0_30px_rgba(212,175,55,0.5)]"
              aria-label={isPlaying ? "إيقاف" : "تشغيل"}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-black" />
              ) : (
                <Play className="w-8 h-8 text-black ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Controls Bar - يظهر دائماً عند التمرير فوق الفيديو */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 to-transparent">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all duration-300 border border-[#D4AF37]/30"
              aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-[#D4AF37]" />
              ) : (
                <Volume2 className="w-5 h-5 text-[#D4AF37]" />
              )}
            </button>

            {/* Play/Pause small button for mobile */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#D4AF37]/80 hover:bg-[#D4AF37] flex items-center justify-center transition-all duration-300 md:hidden"
              aria-label={isPlaying ? "إيقاف" : "تشغيل"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black" />
              ) : (
                <Play className="w-5 h-5 text-black ml-0.5" />
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all duration-300 border border-[#D4AF37]/30"
              aria-label="ملء الشاشة"
            >
              <Maximize className="w-5 h-5 text-[#D4AF37]" />
            </button>
          </div>

          {/* Initial Play Button - يظهر فقط عندما لا يكون الفيديو يعمل */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
            >
              <button
                className="w-20 h-20 rounded-full bg-[#D4AF37]/90 hover:bg-[#D4AF37] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                aria-label="تشغيل"
              >
                <Play className="w-8 h-8 text-black ml-1" />
              </button>
            </div>
          )}

          {/* Golden border glow effect */}
          <div className="absolute inset-0 rounded-2xl border border-[#D4AF37]/20 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
