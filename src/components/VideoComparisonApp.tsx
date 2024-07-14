import React, { useState, useRef, useEffect } from 'react';
import defaultVideo from '../assets/videos/default.mp4';

// アイコンコンポーネント
const Upload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
);

const PlayCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
);

const PauseCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="10" x2="10" y1="15" y2="9" /><line x1="14" x2="14" y1="15" y2="9" /></svg>
);

const RotateCcw = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6" /><path d="M3 13a9 9 0 1 0 3-7.7L3 8" /></svg>
);

const FlipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4"></path>
    <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"></path>
    <line x1="7" y1="9" x2="7" y2="15"></line>
    <line x1="17" y1="9" x2="17" y2="15"></line>
  </svg>
);

const SpeedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 5L5 19"></path>
    <circle cx="6.5" cy="6.5" r="2.5"></circle>
    <circle cx="17.5" cy="17.5" r="2.5"></circle>
  </svg>
);



// Button component
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled = false, variant = 'default' }) => {
  const baseStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    outline: 'none',
  };

  const variantStyles: Record<'default' | 'outline', React.CSSProperties> = {
    default: {
      backgroundColor: '#3B82F6',
      color: 'white',
    },
    outline: {
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #D1D5DB',
    }
  };

  const disabledStyle: React.CSSProperties = {
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  const style: React.CSSProperties = {
    ...baseStyle,
    ...variantStyles[variant],
    ...(disabled ? disabledStyle : {}),
  };

  return (
    <button style={style} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

// Slider component
interface SliderProps {
  value: number[];
  onChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({ value, onChange, min = 0, max = 100, step = 1, disabled = false }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([parseFloat(e.target.value)]);
  };

  const style: React.CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: '#E5E7EB',
    borderRadius: '9999px',
    appearance: 'none',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
    transition: 'opacity 0.2s',
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      disabled={disabled}
      style={style}
    />
  );
};


// VideoPlayer component
interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  src: string | null;
  fileName: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  defaultSrc?: string;
}


const PlayPauseOverlay: React.FC<{
  isPlaying: boolean;
  onPlayPause: () => void;
  onFlip: () => void;
}> = ({ isPlaying, onPlayPause, onFlip }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        onClick={onPlayPause}
        style={{
          cursor: 'pointer',
          padding: '20px',
        }}
      >
        {isPlaying ? <PauseCircle /> : <PlayCircle />}
      </div>
      <div
        onClick={onFlip}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          cursor: 'pointer',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '50%',
          padding: '5px',
        }}
      >
        <FlipIcon />
      </div>
    </div>
  );
};

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  src: string | null;
  fileName: string;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  defaultSrc?: string;
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
}


const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoRef, src, fileName, onFileUpload, currentTime, onTimeUpdate, defaultSrc, playbackSpeed, onPlaybackSpeedChange
}) => {
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleTimeUpdate = () => onTimeUpdate(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef, onTimeUpdate]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, videoRef]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(1, scale + delta), 5); // 最小1倍、最大5倍
    setScale(newScale);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      lastPosition.current = { x: distance, y: distance };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const delta = distance - lastPosition.current.x;
      const newScale = Math.min(Math.max(1, scale + delta * 0.01), 5);
      setScale(newScale);
      lastPosition.current = { x: distance, y: distance };
    } else if (e.touches.length === 1 && scale > 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPosition.current.x;
      const deltaY = touch.clientY - lastPosition.current.y;
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      lastPosition.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      isDragging.current = true;
      lastPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current && scale > 1) {
      const deltaX = e.clientX - lastPosition.current.x;
      const deltaY = e.clientY - lastPosition.current.y;
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      lastPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  // handleMouseUp関数を修正
  const handleMouseUp = (e: React.MouseEvent) => {
    isDragging.current = false;
  };



  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSliderChange = ([time]: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const videoContainerStyle: React.CSSProperties = {
    width: '100%',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const videoWrapperStyle: React.CSSProperties = {
    width: '100%',
    paddingTop: '56.25%',
    position: 'relative',
    backgroundColor: '#f0f0f0',
    marginBottom: '8px',
    overflow: 'hidden',
  };

  const videoStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${100 * scale}%`,
    height: `${100 * scale}%`,
    objectFit: 'contain',
    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scaleX(${isFlipped ? -1 : 1})`,
    transition: 'transform 0.1s ease-out',
  };

  const fileNameStyle: React.CSSProperties = {
    fontSize: '14px',
    marginTop: '8px',
  };

  
  return (
    <div style={videoContainerStyle}>
      <div 
        ref={containerRef}
        style={videoWrapperStyle} 
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={(e) => {
          setShowOverlay(false);
          handleMouseUp(e);
        }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <video 
          ref={videoRef} 
          src={src || defaultSrc}
          style={videoStyle}
          preload="metadata"
        />
        {showOverlay && (
          <PlayPauseOverlay 
            isPlaying={isPlaying} 
            onPlayPause={handlePlayPause}
            onFlip={handleFlip}
          />
        )}
      </div>
      <Slider
        value={[currentTime]}
        onChange={handleSliderChange}
        min={0}
        max={duration}
        step={0.1}
        disabled={!src && !defaultSrc}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '8px' }}>
        <input
          type="file"
          ref={fileInputRef}
          accept="video/*"
          onChange={onFileUpload}
          style={{ display: 'none' }}
        />
        <Button onClick={triggerFileInput} variant="outline">
          <Upload /> 動画をアップロード
        </Button>
        {fileName && <p style={fileNameStyle}>{fileName}</p>}
      </div>
    </div>
  );
};


const VideoComparisonApp: React.FC = () => {
  const [leftVideo, setLeftVideo] = useState<string | null>(null);
  const [rightVideo, setRightVideo] = useState<string | null>(null);
  const [leftFileName, setLeftFileName] = useState('');
  const [rightFileName, setRightFileName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [leftCurrentTime, setLeftCurrentTime] = useState(0);
  const [rightCurrentTime, setRightCurrentTime] = useState(0);
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handleFileUpload = (side: 'left' | 'right') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (side === 'left') {
        setLeftVideo(url);
        setLeftFileName(file.name);
      } else {
        setRightVideo(url);
        setRightFileName(file.name);
      }
    }
  };

  const handlePlayPauseBoth = () => {
    const leftVideo = leftVideoRef.current;
    const rightVideo = rightVideoRef.current;
    if (leftVideo && rightVideo) {
      if (isPlaying) {
        leftVideo.pause();
        rightVideo.pause();
      } else {
        leftVideo.play();
        rightVideo.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (leftVideoRef.current) leftVideoRef.current.currentTime = 0;
    if (rightVideoRef.current) rightVideoRef.current.currentTime = 0;
    setLeftCurrentTime(0);
    setRightCurrentTime(0);
    setIsPlaying(false);
  };

  const handlePlaybackSpeedChange = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
  };

  const containerStyle: React.CSSProperties = {
    padding: '16px',
    maxWidth: '1024px',
    margin: '0 auto',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
  };

  const flexContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    height: '500px',
  };

  const controlsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '16px',
    gap: '16px',
  };

  const speedControlStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '200px', // スライダーの幅を広げる
  };


  const canPlay = (leftVideo || defaultVideo) && rightVideo;

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>くらべるツール</h1>
      <div style={flexContainerStyle}>
        <VideoPlayer
          videoRef={leftVideoRef}
          src={leftVideo}
          fileName={leftFileName}
          onFileUpload={handleFileUpload('left')}
          currentTime={leftCurrentTime}
          onTimeUpdate={setLeftCurrentTime}
          defaultSrc={defaultVideo}
          playbackSpeed={playbackSpeed}
          onPlaybackSpeedChange={handlePlaybackSpeedChange}
        />
        <VideoPlayer
          videoRef={rightVideoRef}
          src={rightVideo}
          fileName={rightFileName}
          onFileUpload={handleFileUpload('right')}
          currentTime={rightCurrentTime}
          onTimeUpdate={setRightCurrentTime}
          playbackSpeed={playbackSpeed}
          onPlaybackSpeedChange={handlePlaybackSpeedChange}
        />
      </div>
      <div style={controlsContainerStyle}>
        <Button onClick={handlePlayPauseBoth} disabled={!canPlay}>
          {isPlaying ? <PauseCircle /> : <PlayCircle />}
          {isPlaying ? '両方一時停止' : '両方再生'}
        </Button>
        <Button onClick={handleReset} disabled={!canPlay}>
          <RotateCcw /> リセット
        </Button>
        <div style={speedControlStyle}>
          <SpeedIcon />
          <Slider
            value={[playbackSpeed]}
            onChange={([speed]) => handlePlaybackSpeedChange(speed)}
            min={0.1}  // 最小速度を0.1倍に変更
            max={2}
            step={0.1}  // ステップを0.1に変更してより細かい調整を可能に
            disabled={!canPlay}
          />
          <span>{playbackSpeed.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
};

export default VideoComparisonApp;