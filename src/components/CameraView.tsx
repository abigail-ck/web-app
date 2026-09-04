import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Zap, ZapOff, RefreshCw, X, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { EventConfig, PhotoStyleId } from '../types';
import { soundEffects } from '../utils/audio';
import { processImageWithStyle } from '../utils/filmProcessing';
import { WatermarkFond } from './WatermarkFond';

interface CameraViewProps {
  eventConfig: EventConfig;
  currentUser: string;
  onClose: () => void;
  onPhotoCaptured: (capturedDataUrl: string, rawDataUrl: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  eventConfig,
  currentUser,
  onClose,
  onPhotoCaptured,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isShutterPressed, setIsShutterPressed] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);

  // Initialize Camera Stream
  const initCamera = useCallback(async (facing: 'user' | 'environment') => {
    setIsLoadingCamera(true);
    setCameraError(null);

    // Stop existing stream tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setIsLoadingCamera(false);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      // If environment camera failed, try user camera
      if (facing === 'environment') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
          }
          setIsLoadingCamera(false);
          return;
        } catch {
          // Both failed
        }
      }
      setCameraError('Cámara no disponible. Puedes subir una foto desde tu galería.');
      setIsLoadingCamera(false);
    }
  }, []);

  useEffect(() => {
    initCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Flip Camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture Photo
  const handleCapture = async () => {
    if (isShutterPressed) return;
    setIsShutterPressed(true);

    // Play mechanical shutter click + film advance audio
    soundEffects.playShutter();

    // Trigger visual flash if enabled or for tactile feedback
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 220);

    try {
      let rawDataUrl = '';

      if (videoRef.current && videoRef.current.videoWidth > 0) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // If front camera, mirror horizontally
          if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        }
      } else {
        // Fallback sample photo if camera not active
        rawDataUrl = 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1080&q=85';
      }

      // Process default Vintage Film preset
      const processedUrl = await processImageWithStyle(
        videoRef.current || (await loadImage(rawDataUrl)),
        'vintage'
      );

      // Stop stream before moving to style selector
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      setTimeout(() => {
        onPhotoCaptured(processedUrl, rawDataUrl);
      }, 350);
    } catch (err) {
      console.error('Photo capture error:', err);
      setIsShutterPressed(false);
    }
  };

  // Helper to load image
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = src;
    });
  };

  // Handle File Upload Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.playShutter();
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = await loadImage(rawDataUrl);
      const processedUrl = await processImageWithStyle(img, 'vintage');

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      onPhotoCaptured(processedUrl, rawDataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1614] text-[#FAF7F0] flex flex-col justify-between overflow-hidden select-none">
      {/* Visual Flash Effect */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header className="relative z-20 px-4 py-3 sm:py-4 flex items-center justify-between bg-gradient-to-b from-[#1A1614]/90 to-transparent">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 text-[#FAF7F0]/80 hover:text-[#FAF7F0] hover:bg-[#FAF7F0]/10 rounded-full transition-colors cursor-pointer"
        >
          <X size={22} />
        </button>

        {/* Center Event Header & Countdown */}
        <div className="text-center">
          <div className="font-typewriter text-xs sm:text-sm text-[#FAF7F0] tracking-wide font-medium truncate max-w-[200px] sm:max-w-xs">
            {eventConfig.title}
          </div>
          <div className="font-typewriter text-[11px] text-[#C48B9F] flex items-center justify-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C48B9F] animate-pulse" />
            <span>{eventConfig.timeLeftDisplay} restante</span>
          </div>
        </div>

        {/* User Badge */}
        <div className="font-typewriter text-xs text-[#FAF7F0]/70 bg-[#FAF7F0]/10 px-2.5 py-1 rounded-full border border-[#FAF7F0]/15">
          {currentUser}
        </div>
      </header>

      {/* Main Viewfinder Section */}
      <main className="relative flex-1 mx-3 sm:mx-6 my-1 flex items-center justify-center overflow-hidden">
        {/* Viewfinder Frame with Torn Paper Edge & Heavy Film Grain */}
        <div className="relative w-full max-w-md aspect-[3/4] sm:aspect-[4/5] rounded-xl overflow-hidden bg-[#2C241E] shadow-[0_10px_30px_rgba(0,0,0,0.6)] border-2 border-[#D4C7B5]/40 flex items-center justify-center">
          {/* Live Video Stream */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{
              transform: `scale(${zoomLevel}) ${facingMode === 'user' ? 'scaleX(-1)' : ''}`,
            }}
            className="w-full h-full object-cover filter-vintage-film transition-transform duration-200"
          />

          {/* Film Grain Texture Overlay */}
          <div className="absolute inset-0 heavy-film-grain pointer-events-none" />

          {/* Authentic Camera Viewfinder Reticle / Crosshairs */}
          <div className="absolute inset-4 pointer-events-none border border-[#FAF7F0]/20 rounded-lg flex flex-col justify-between p-3">
            <div className="flex justify-between items-start text-[10px] font-typewriter text-[#FAF7F0]/60">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                <span>REC • 35MM</span>
              </div>
              <div className="bg-[#1A1614]/60 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                VINTAGE CÁLIDO
              </div>
            </div>

            {/* Center Focus Reticle Box */}
            <div className="self-center w-16 h-16 border border-[#FAF7F0]/40 rounded-sm relative flex items-center justify-center opacity-60">
              <div className="w-1 h-1 bg-[#C48B9F] rounded-full" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-[1px] bg-[#FAF7F0]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-[1px] bg-[#FAF7F0]" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-[1px] h-2 bg-[#FAF7F0]" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-[1px] h-2 bg-[#FAF7F0]" />
            </div>

            {/* Bottom Viewfinder Info */}
            <div className="flex justify-between items-end text-[10px] font-typewriter text-[#FAF7F0]/60">
              <span>F/2.8 • 1/125s</span>
              <span>ISO 400</span>
            </div>
          </div>

          {/* Camera Error / Loading Message Fallback */}
          {cameraError && (
            <div className="absolute inset-0 bg-[#2C241E]/95 p-6 flex flex-col items-center justify-center text-center z-30">
              <AlertCircle size={32} className="text-[#C48B9F] mb-3" />
              <p className="font-serif-vintage text-lg text-[#FAF7F0] mb-4">
                {cameraError}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#FAF7F0] text-[#2C241E] px-4 py-2.5 rounded-xl font-typewriter text-xs font-semibold flex items-center gap-2 shadow-md hover:bg-[#F4EFE6] cursor-pointer"
              >
                <Upload size={16} />
                <span>Elegir desde la galería</span>
              </button>
            </div>
          )}

          {isLoadingCamera && !cameraError && (
            <div className="absolute inset-0 bg-[#2C241E]/80 flex flex-col items-center justify-center z-20">
              <div className="w-8 h-8 border-2 border-[#C48B9F] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-typewriter text-xs text-[#FAF7F0]/80">
                Inicializando el carrete...
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Camera Controls Bar */}
      <footer className="relative z-20 px-6 py-4 sm:py-6 bg-gradient-to-t from-[#1A1614] via-[#1A1614]/90 to-transparent flex flex-col items-center gap-4">
        {/* Top Controls: Zoom & Flash */}
        <div className="flex items-center justify-center gap-6">
          {/* Flash Toggle */}
          <button
            onClick={() => setFlashMode(flashMode === 'off' ? 'on' : 'off')}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${
              flashMode === 'on'
                ? 'bg-[#C5A059] text-[#1A1614]'
                : 'bg-[#FAF7F0]/10 text-[#FAF7F0]/70 hover:text-[#FAF7F0]'
            }`}
            title="Flash"
          >
            {flashMode === 'on' ? <Zap size={18} /> : <ZapOff size={18} />}
          </button>

          {/* Zoom Buttons (0.5x, 1.0x, 2.0x) */}
          <div className="flex items-center bg-[#FAF7F0]/10 p-1 rounded-full border border-[#FAF7F0]/15">
            {[
              { label: '0.5x', value: 0.8 },
              { label: '1.0x', value: 1.0 },
              { label: '2.0x', value: 1.6 },
            ].map((z) => (
              <button
                key={z.label}
                onClick={() => setZoomLevel(z.value)}
                className={`px-3 py-1 rounded-full text-xs font-typewriter transition-all cursor-pointer ${
                  zoomLevel === z.value
                    ? 'bg-[#FAF7F0] text-[#1A1614] font-bold shadow-sm'
                    : 'text-[#FAF7F0]/70 hover:text-[#FAF7F0]'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          {/* Flip Camera */}
          <button
            onClick={toggleFacingMode}
            className="p-2.5 rounded-full bg-[#FAF7F0]/10 text-[#FAF7F0]/70 hover:text-[#FAF7F0] hover:bg-[#FAF7F0]/20 transition-all cursor-pointer"
            title="Cambiar de cámara"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Shutter Button & Gallery Upload */}
        <div className="w-full max-w-xs flex items-center justify-between px-4">
          {/* Gallery Upload Icon */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-[#FAF7F0]/15 hover:bg-[#FAF7F0]/25 text-[#FAF7F0] rounded-full transition-all cursor-pointer border border-[#FAF7F0]/20"
            title="Subir una foto"
          >
            <Upload size={20} />
          </button>

          {/* Rustic Textured Metal Shutter Button */}
          <button
            onClick={handleCapture}
            disabled={isShutterPressed}
            className="w-20 h-20 sm:w-22 sm:h-22 rounded-full shutter-metal-button flex items-center justify-center cursor-pointer transition-all duration-150 relative active:scale-95 group"
            title="Tomar foto"
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-[#FAF7F0]/60 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F0]/40 group-hover:bg-[#FAF7F0]/60 transition-colors" />
            </div>
          </button>

          {/* Watermark text */}
          <div className="w-10 flex justify-end">
            <WatermarkFond size="sm" variant="light" />
          </div>
        </div>

        {/* Hidden File Input for Gallery Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </footer>
    </div>
  );
};
