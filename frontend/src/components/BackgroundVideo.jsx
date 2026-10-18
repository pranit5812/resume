import React, { useEffect, useRef } from 'react';

const BackgroundVideo = () => {
  const videoRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fadingOutRef = useRef(false);

  const fade = (targetOpacity, duration, onComplete) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const video = videoRef.current;
    if (!video) return;

    const startOpacity = parseFloat(video.style.opacity || '0');
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
      video.style.opacity = currentOpacity.toString();

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
        if (onComplete) onComplete();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play()
        .then(() => {
          fade(1, 500);
        })
        .catch((err) => {
          console.error("Autoplay failed:", err);
          // Fallback fade in anyway
          fade(1, 500);
        });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const timeLeft = video.duration - video.currentTime;
    // Fade out when 0.55 seconds remain before the video ends
    if (timeLeft <= 0.55 && !fadingOutRef.current) {
      fadingOutRef.current = true;
      fade(0, 500);
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    video.style.opacity = '0';

    // On ended, opacity is set to 0, then after 100ms the video resets to currentTime = 0, plays, and fades back in.
    setTimeout(() => {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.currentTime = 0;
        videoElement.play()
          .then(() => {
            fadingOutRef.current = false;
            fade(1, 500);
          })
          .catch((err) => {
            console.error("Play failed on loop reset:", err);
          });
      }
    }, 100);
  };

  return (
    <video
      ref={videoRef}
      src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
      muted
      autoPlay
      playsInline
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      className="absolute inset-0 w-full h-full object-cover translate-y-[17%] pointer-events-none"
      style={{ opacity: 0 }}
    />
  );
};

export default BackgroundVideo;
