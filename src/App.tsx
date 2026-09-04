import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ActiveScreen, Contributor, EventConfig, EventPhoto, PhotoStyleId } from './types';
import { INITIAL_CONTRIBUTORS, INITIAL_EVENT_CONFIG, INITIAL_PHOTOS } from './data/initialPhotos';
import { SplashScreen } from './components/SplashScreen';
import { EventDashboard } from './components/EventDashboard';
import { CameraView } from './components/CameraView';
import { PhotoStyleSelector } from './components/PhotoStyleSelector';
import { GalleryView } from './components/GalleryView';
import { PeopleModal } from './components/PeopleModal';
import { DownloadAlbumModal } from './components/DownloadAlbumModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { createPolaroidExport } from './utils/filmProcessing';

export default function App() {
  // State: Screen Navigation
  const [screen, setScreen] = useState<ActiveScreen>(() => {
    const savedUser = localStorage.getItem('jardin_user');
    return savedUser ? 'dashboard' : 'splash';
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('jardin_user') || '';
  });

  const [eventConfig, setEventConfig] = useState<EventConfig>(INITIAL_EVENT_CONFIG);

  // Photos State
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

  // Contributors State
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

  // Camera Capture Temporary Buffers
  const [capturedRaw, setCapturedRaw] = useState<string>('');
  const [capturedProcessed, setCapturedProcessed] = useState<string>('');

  // Modals & Popups
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPeopleModalOpen, setIsPeopleModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedPhotoForDetail, setSelectedPhotoForDetail] = useState<EventPhoto | null>(null);
  const [filterAuthorForGallery, setFilterAuthorForGallery] = useState<string>('all');

  // Sync to localStorage
  useEffect(() => {
    if (userName) {
      localStorage.setItem('jardin_user', userName);
    }
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('jardin_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('jardin_contributors', JSON.stringify(contributors));
  }, [contributors]);

  // Handle User Entering Splash Screen
  const handleEnterFromSplash = (name: string) => {
    setUserName(name);
    // Add user to contributors list if not already present
    setContributors((prev) => {
      const exists = prev.some((c) => c.name.toLowerCase() === name.toLowerCase());
      if (!exists) {
        const initials = name
          .split('.')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'IN';
        return [
          {
            id: String(Date.now()),
            name,
            initials,
            avatarColor: '#B36D72',
            photoCount: 0,
            role: 'Invité',
            lastActive: 'À l’instant',
          },
          ...prev,
        ];
      }
      return prev;
    });
    setScreen('dashboard');
  };

  // Handle Photo Captured in Camera
  const handlePhotoCaptured = (processedDataUrl: string, rawDataUrl: string) => {
    setCapturedProcessed(processedDataUrl);
    setCapturedRaw(rawDataUrl);
    setScreen('style-selector');
  };

  // Handle Style Selection Confirmed
  const handleStyleConfirmed = (
    finalPhotoUrl: string,
    selectedStyle: PhotoStyleId,
    caption?: string
  ) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeFormatted = `${hours}:${minutes}`;

    const newPhoto: EventPhoto = {
      id: `photo_${Date.now()}`,
      url: finalPhotoUrl,
      originalUrl: capturedRaw,
      author: userName || 'Invité Spécial',
      caption: caption,
      timestamp: now.toISOString(),
      formattedTime: timeFormatted,
      style: selectedStyle,
      likes: 1,
      hasLiked: true,
      tag: 'Instantané',
      rotationDeg: (Math.random() - 0.5) * 4.5,
      location: 'Jardin des Souvenirs',
    };

    // Prepend new photo to journal
    setPhotos((prev) => [newPhoto, ...prev]);

    // Update contributor count
    setContributors((prev) =>
      prev.map((c) => {
        if (c.name.toLowerCase() === (userName || 'Invité Spécial').toLowerCase()) {
          return { ...c, photoCount: c.photoCount + 1, lastActive: 'À l’instant' };
        }
        return c;
      })
    );

    // Trigger subtle gold & rose confetti burst
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#C48B9F', '#68795A', '#D4A373', '#FAF7F0'],
      ticks: 200,
    });

    setScreen('dashboard');
  };

  // Handle Like Photo
  const handleLikePhoto = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id === photoId) {
          const hasLiked = !photo.hasLiked;
          return {
            ...photo,
            likes: hasLiked ? photo.likes + 1 : Math.max(0, photo.likes - 1),
            hasLiked,
          };
        }
        return photo;
      })
    );
  };

  // Handle Single Polaroid Download
  const handleDownloadSinglePhoto = async (photo: EventPhoto) => {
    try {
      const polaroidUrl = await createPolaroidExport(
        photo.url,
        photo.author,
        photo.caption,
        eventConfig.dateOrigin
      );
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

  // Next / Prev in Detail Modal
  const handleNextPhoto = () => {
    if (!selectedPhotoForDetail) return;
    const currentIndex = photos.findIndex((p) => p.id === selectedPhotoForDetail.id);
    if (currentIndex >= 0 && currentIndex < photos.length - 1) {
      setSelectedPhotoForDetail(photos[currentIndex + 1]);
    } else {
      setSelectedPhotoForDetail(photos[0]);
    }
  };

  const handlePrevPhoto = () => {
    if (!selectedPhotoForDetail) return;
    const currentIndex = photos.findIndex((p) => p.id === selectedPhotoForDetail.id);
    if (currentIndex > 0) {
      setSelectedPhotoForDetail(photos[currentIndex - 1]);
    } else {
      setSelectedPhotoForDetail(photos[photos.length - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#2C241E] font-serif-vintage">
      {/* Screen Routing */}
      {screen === 'splash' && (
        <SplashScreen
          eventConfig={eventConfig}
          onEnter={handleEnterFromSplash}
          initialUserName={userName}
        />
      )}

      {screen === 'dashboard' && (
        <EventDashboard
          eventConfig={eventConfig}
          photos={photos}
          contributors={contributors}
          currentUser={userName || 'Invité Spécial'}
          onOpenLiveCamera={() => setScreen('camera')}
          onOpenGallery={() => {
            setFilterAuthorForGallery('all');
            setIsGalleryOpen(true);
          }}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          onOpenPeopleModal={() => setIsPeopleModalOpen(true)}
          onLikePhoto={handleLikePhoto}
          onSelectPhoto={(photo) => setSelectedPhotoForDetail(photo)}
          onDownloadSinglePhoto={handleDownloadSinglePhoto}
        />
      )}

      {screen === 'camera' && (
        <CameraView
          eventConfig={eventConfig}
          currentUser={userName || 'Invité Spécial'}
          onClose={() => setScreen('dashboard')}
          onPhotoCaptured={handlePhotoCaptured}
        />
      )}

      {screen === 'style-selector' && (
        <PhotoStyleSelector
          initialProcessedUrl={capturedProcessed}
          rawImageUrl={capturedRaw}
          currentUser={userName || 'Invité Spécial'}
          onBack={() => setScreen('camera')}
          onConfirm={handleStyleConfirmed}
        />
      )}

      {/* Global Gallery Modal */}
      {isGalleryOpen && (
        <GalleryView
          photos={photos}
          initialFilterAuthor={filterAuthorForGallery}
          onClose={() => setIsGalleryOpen(false)}
          onLikePhoto={handleLikePhoto}
          onSelectPhoto={(photo) => {
            setSelectedPhotoForDetail(photo);
          }}
          onOpenDownloadModal={() => {
            setIsGalleryOpen(false);
            setIsDownloadModalOpen(true);
          }}
          onOpenPeopleModal={() => {
            setIsGalleryOpen(false);
            setIsPeopleModalOpen(true);
          }}
        />
      )}

      {/* People / Guests Modal */}
      <PeopleModal
        isOpen={isPeopleModalOpen}
        onClose={() => setIsPeopleModalOpen(false)}
        contributors={contributors}
        currentUser={userName || 'Invité Spécial'}
        onSelectContributor={(authorName) => {
          setFilterAuthorForGallery(authorName);
          setIsGalleryOpen(true);
        }}
      />

      {/* Download Album Modal */}
      <DownloadAlbumModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        photos={photos}
        eventConfig={eventConfig}
      />

      {/* Photo Detail Modal */}
      <PhotoDetailModal
        photo={selectedPhotoForDetail}
        onClose={() => setSelectedPhotoForDetail(null)}
        onLike={handleLikePhoto}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
        hasNext={photos.length > 1}
        hasPrev={photos.length > 1}
      />
    </div>
  );
}
