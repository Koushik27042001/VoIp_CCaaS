let localStream = null;

const assertMediaSupport = () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Microphone access is not supported in this browser.");
  }
};

export const getLocalStream = async () => {
  if (localStream && localStream.active) {
    return localStream;
  }

  try {
    assertMediaSupport();

    localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    console.log("Microphone connected");

    return localStream;
  } catch (error) {
    localStream = null;
    console.error("Media access failed:", error);
    throw error;
  }
};

export const getCurrentStream = () => localStream;

export const setMicrophoneEnabled = (enabled) => {
  if (!localStream) return;

  localStream.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });
};

export const stopLocalStream = () => {
  if (!localStream) return;

  localStream.getTracks().forEach((track) => {
    track.stop();
  });

  localStream = null;
};
