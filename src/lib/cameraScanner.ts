// Realtime Camera Video Stream QR Code Reader Helper
export async function startCameraStream(
  videoElement: HTMLVideoElement,
  onCodeScanned: (code: string) => void
): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    });
    videoElement.srcObject = stream;
    await videoElement.play();
    return stream;
  } catch (err) {
    console.error('Camera access error:', err);
    return null;
  }
}

export function stopCameraStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach(track => track.stop());
}
