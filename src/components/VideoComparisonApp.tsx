import React, { useState, useRef, useEffect } from 'react';
import defaultVideo from '../assets/videos/default.mp4';

// アイコンコンポーネント
const Upload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);

const PlayCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
);

const PauseCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>
);

const RotateCcw = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>
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

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoRef, src, fileName, onFileUpload, currentTime, onTimeUpdate, defaultSrc 
}) => {
  const [duration, setDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleTimeUpdate = () => onTimeUpdate(video.currentTime);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef, onTimeUpdate]);

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
    height: '100%', // 親要素の高さいっぱいに広げる
  };

  const videoWrapperStyle: React.CSSProperties = {
    width: '100%',
    paddingTop: '56.25%', // 16:9のアスペクト比を保つ
    position: 'relative',
    backgroundColor: '#f0f0f0', // プレースホルダーの背景色
    marginBottom: '8px',
  };

  const videoStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain', // アスペクト比を保ちながらフィットさせる
  };

  const fileNameStyle: React.CSSProperties = {
    fontSize: '14px',
    marginTop: '8px',
  };

  return (
    <div style={videoContainerStyle}>
      <div style={videoWrapperStyle}>
        <video 
          ref={videoRef} 
          src={src || defaultSrc}
          style={videoStyle}
          preload="metadata"
        />
      </div>
      <Slider
        value={[currentTime]}
        onChange={handleSliderChange}
        min={0}
        max={duration}
        step={0.1}
        disabled={!src && !defaultSrc}
      />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '8px'}}>
        <input
          type="file"
          ref={fileInputRef}
          accept="video/*"
          onChange={onFileUpload}
          style={{display: 'none'}}
        />
        <Button onClick={triggerFileInput} variant="outline">
          <Upload /> 動画をアップロード
        </Button>
        {fileName && <p style={fileNameStyle}>{fileName}</p>}
      </div>
    </div>
  );
};

// Main VideoComparisonApp component
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

  const handlePlayPause = () => {
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
    height: '500px', // 固定の高さを設定
  };

  const controlsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '16px',
    gap: '16px',
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
        />
        <VideoPlayer
          videoRef={rightVideoRef}
          src={rightVideo}
          fileName={rightFileName}
          onFileUpload={handleFileUpload('right')}
          currentTime={rightCurrentTime}
          onTimeUpdate={setRightCurrentTime}
        />
      </div>
      <div style={controlsContainerStyle}>
        <Button onClick={handlePlayPause} disabled={!canPlay}>
          {isPlaying ? <PauseCircle /> : <PlayCircle />}
          {isPlaying ? '一時停止' : '再生'}
        </Button>
        <Button onClick={handleReset} disabled={!canPlay}>
          <RotateCcw /> リセット
        </Button>
      </div>
    </div>
  );
};

export default VideoComparisonApp;