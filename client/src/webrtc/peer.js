let peerConnection = null;
let remoteAudio = null;

const envIceServers = [
  process.env.REACT_APP_STUN_URL && {
    urls: process.env.REACT_APP_STUN_URL,
  },
  process.env.REACT_APP_TURN_URL && {
    urls: process.env.REACT_APP_TURN_URL,
    username: process.env.REACT_APP_TURN_USERNAME,
    credential: process.env.REACT_APP_TURN_CREDENTIAL,
  },
].filter(Boolean);

const defaultIceServers = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];

const peerConfig = {
  iceServers: envIceServers.length > 0 ? envIceServers : defaultIceServers,
};

const getRemoteAudio = () => {
  if (remoteAudio) return remoteAudio;

  remoteAudio = new Audio();
  remoteAudio.autoplay = true;
  remoteAudio.playsInline = true;

  return remoteAudio;
};

export const createPeerConnection = ({ onIceCandidate, onConnectionStateChange } = {}) => {
  closePeerConnection();

  peerConnection = new RTCPeerConnection(peerConfig);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate?.(event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    const [stream] = event.streams;
    if (!stream) return;

    const audio = getRemoteAudio();
    audio.srcObject = stream;

    audio.play().catch((error) => {
      console.warn("Remote audio playback is waiting for browser permission:", error);
    });

    console.log("Remote audio connected");
  };

  peerConnection.onconnectionstatechange = () => {
    onConnectionStateChange?.(peerConnection.connectionState);
  };

  console.log("Peer connection created");

  return peerConnection;
};

export const getPeerConnection = () => peerConnection;

export const closePeerConnection = () => {
  if (peerConnection) {
    peerConnection.onicecandidate = null;
    peerConnection.ontrack = null;
    peerConnection.onconnectionstatechange = null;
    peerConnection.getSenders().forEach((sender) => {
      sender.track?.stop();
    });
    peerConnection.close();
    peerConnection = null;
  }

  if (remoteAudio) {
    remoteAudio.pause();
    remoteAudio.srcObject = null;
    remoteAudio = null;
  }
};
