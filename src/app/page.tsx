"use client"

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function Home() {
  const videoRef = useRef<any>(null);

  useEffect(() => {
    let hls: any;

    const initializeHls = () => {
      if (videoRef.current) {
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = "https://live.quic.space/hls/helloworld.m3u8";
        } else if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });

          hls.loadSource("https://live.quic.space/hls/helloworld.m3u8");
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current.play().catch((error: any) => {
              console.error('Error attempting to play:', error);
            });
          });

          hls.on(Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('Fatal error, cannot recover:', data);
                  hls.destroy();
                  break;
              }
            }
          });
        } else {
          console.error('HLS is not supported in this browser.');
        }
      }
    };

    initializeHls();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      playsInline
      className="w-full h-full"
      style={{ backgroundColor: 'black' }}
    />
  );
}
