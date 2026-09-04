import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { ActiveScreen, Contributor, EventConfig, EventPhoto, PhotoStyleId } from './types';
import { INITIAL_CONTRIBUTORS, INITIAL_EVENT_CONFIG, INITIAL_PHOTOS } from './data/initialPhotos';
import { SplashScreen } from './components/SplashScreen';
import { EventDashboard } from './components/EventDashboard';
import { CameraView } from './components/CameraView';
import { PhotoStyleSelector } from './components/PhotoStyleSelector';
import { GalleryView } from './components/GalleryView';
import { PeopleModal } from './components/PeopleModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { RevealScreen } from './components/RevealScreen';
import { createPolaroidExport } from './utils/filmProcessing';

const GUEST_FALLBACK = 'Invitado Especial';

export default function App() {
  const [screen, setScreen] = useState<ActiveScreen>(() =>
    localStorage.getItem('jardin_user') ? 'dashboard' : 'splash'
  );
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('jardin_user') || '');
  const [eventConfig] = useState<EventConfig>(INITIAL_EVENT_CONFIG);

  // All photos of the event (own + others). Others stay hidden until the album is revealed.
  const [photos, setPhotos] = useState<EventPhoto[]>(() => {
    const saved = localStorage.getItem('jardin_photos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PHOTOS;
      }
    }
    return INITIAL_PHOTOS;
  });

  const [contributors, setContributors] = useState<Contributor[]>(() => {
    const saved = localStorage.getItem('jardin_contributors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CONTRIBUTORS;
      }
    }
    return INITIAL_CONTRIBUTORS;
  });

  const [capturedRaw, setCapturedRaw] = useState<string>('');
  const [capturedProcessed, setCapturedProcessed] = useState<string>('');

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPeopleModalOpen, setIsPeopleModalOpen] = useState(false);
  const [isRevealOpen, setIsRevealOpen] = useState(false);
  const [selectedPhotoForDetail, setSelectedPhotoForDetail] = useState<EventPhoto | null>(null);

  const currentUser = userName || GUEST_FALLBACK;

  // Only the guest's own photos are visible for now
  const myPhotos = useMemo(
    () => photos.filter((p) => p.author.toLowerCase() === currentUser.toLowerCase()),
    [photos, currentUser]
  );
  const totalMoments = eventConfig.totalMoments + (photos.length - INITIAL_PHOTOS.length);

  useEffect(() => {
    if (userName) localStorage.setItem('jardin_user', userName);
  }, [userName]);

  useEffect(() => {
    try {
      localStorage.setItem('jardin_photos', JSON.stringify(photos));
    } catch (err) {
      console.warn('No se pudieron guardar las fotos en este dispositivo (almacenamiento lleno).', err);
    }
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('jardin_contributors', JSON.stringify(contributors));
  }, [contributors]);

  const handleLogout = () => {
    localStorage.removeItem('jardin_user');
    setUserName('');
    setIsGalleryOpen(false);
    setIsPeopleModalOpen(false);
    setIsRevealOpen(false);
    setSelectedPhotoForDetail(null);
    setScreen('splash');
  };

  const handleEnterFromSplash = (name: string) => {
    setUserName(name);
    setContributors((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === name.toLowerCase())) return prev;
      const initials =
        name
          .split(/[.\s]+/)
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'IN';
      return [
        { id: String(Date.now()), name, initials, avatarColor: '#B36D72', photoCount: 0, role: 'Invitado', lastActive: 'ahora' },
        ...prev,
      ];
    });
    setScreen('dashboard');
  };

  const handlePhotoCaptured = (processedDataUrl: string, rawDataUrl: string) => {
    setCapturedProcessed(processedDataUrl);
    setCapturedRaw(rawDataUrl);
    setScreen('style-selector');
  };

  const handleStyleConfirmed = (finalPhotoUrl: string, selectedStyle: PhotoStyleId, caption?: string) => {
    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newPhoto: EventPhoto = {
      id: `photo_${Date.now()}`,
      url: finalPhotoUrl,
      originalUrl: capturedRaw,
      author: currentUser,
      caption,
      timestamp: now.toISOString(),
      formattedTime: timeFormatted,
      style: selectedStyle,
      likes: 1,
      hasLiked: true,
      tag: 'Instantánea',
      rotationDeg: (Math.random() - 0.5) * 4.5,
      location: eventConfig.subtitle.split('•')[0].trim(),
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    setContributors((prev) =>
      prev.map((c) =>
        c.name.toLowerCase() === currentUser.toLowerCase() ? { ...c, photoCount: c.photoCount + 1, lastActive: 'ahora' } : c
      )
    );

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#C48B9F', '#68795A', '#D4A373', '#FAF7F0'],
      ticks: 200,
    });

    setScreen('dashboard');
  };

  const handleLikePhoto = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id !== photoId) return photo;
        const hasLiked = !photo.hasLiked;
        return { ...photo, likes: hasLiked ? photo.likes + 1 : Math.max(0, photo.likes - 1), hasLiked };
      })
    );
    setSelectedPhotoForDetail((sel) =>
      sel && sel.id === photoId
        ? { ...sel, hasLiked: !sel.hasLiked, likes: !sel.hasLiked ? sel.likes + 1 : Math.max(0, sel.likes - 1) }
        : sel
    );
  };

  const handleDownloadSinglePhoto = async (photo: EventPhoto) => {
    try {
      const polaroidUrl = await createPolaroidExport(photo.url, photo.author, photo.caption, eventConfig.dateOrigin);
      const link = document.createElement('a');
      link.href = polaroidUrl;
      link.download = `Jardin_Recuerdos_${photo.author}_${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Detail navigation moves within the guest's own photos
  const stepDetail = (dir: 1 | -1) => {
    if (!selectedPhotoForDetail || myPhotos.length === 0) return;
    const i = myPhotos.findIndex((p) => p.id === selectedPhotoForDetail.id);
    const next = (i + dir + myPhotos.length) % myPhotos.length;
    setSelectedPhotoForDetail(myPhotos[next]);
  };

  return (
    <div className="min-h-dvh bg-[#F8F5EE] text-[#2C241E] font-display">
      {screen === 'splash' && (
        <SplashScreen eventConfig={eventConfig} onEnter={handleEnterFromSplash} initialUserName={userName} />
      )}

      {screen === 'dashboard' && (
        <EventDashboard
          eventConfig={eventConfig}
          myPhotos={myPhotos}
          totalMoments={totalMoments}
          currentUser={currentUser}
          onOpenLiveCamera={() => setScreen('camera')}
          onOpenGallery={() => setIsGalleryOpen(true)}
          onOpenPeopleModal={() => setIsPeopleModalOpen(true)}
          onOpenReveal={() => setIsRevealOpen(true)}
          onLogout={handleLogout}
          onLikePhoto={handleLikePhoto}
          onSelectPhoto={setSelectedPhotoForDetail}
          onDownloadSinglePhoto={handleDownloadSinglePhoto}
        />
      )}

      {screen === 'camera' && (
        <CameraView
          eventConfig={eventConfig}
          currentUser={currentUser}
          onClose={() => setScreen('dashboard')}
          onPhotoCaptured={handlePhotoCaptured}
        />
      )}

      {screen === 'style-selector' && (
        <PhotoStyleSelector
          initialProcessedUrl={capturedProcessed}
          rawImageUrl={capturedRaw}
          currentUser={currentUser}
          onBack={() => setScreen('camera')}
          onConfirm={handleStyleConfirmed}
        />
      )}

      {isGalleryOpen && (
        <GalleryView
          photos={myPhotos}
          onClose={() => setIsGalleryOpen(false)}
          onLikePhoto={handleLikePhoto}
          onSelectPhoto={setSelectedPhotoForDetail}
          onOpenReveal={() => setIsRevealOpen(true)}
          onOpenCamera={() => {
            setIsGalleryOpen(false);
            setScreen('camera');
          }}
        />
      )}

      <PeopleModal
        isOpen={isPeopleModalOpen}
        onClose={() => setIsPeopleModalOpen(false)}
        contributors={contributors}
        currentUser={currentUser}
        totalPeople={eventConfig.totalPeople}
      />

      <RevealScreen
        isOpen={isRevealOpen}
        eventConfig={eventConfig}
        totalMoments={totalMoments}
        onClose={() => setIsRevealOpen(false)}
      />

      <PhotoDetailModal
        photo={selectedPhotoForDetail}
        onClose={() => setSelectedPhotoForDetail(null)}
        onLike={handleLikePhoto}
        onNext={() => stepDetail(1)}
        onPrev={() => stepDetail(-1)}
        hasNext={myPhotos.length > 1}
        hasPrev={myPhotos.length > 1}
      />
    </div>
  );
}
