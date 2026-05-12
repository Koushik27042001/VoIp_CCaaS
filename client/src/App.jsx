import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import { getSocket, initSocket } from "./utils/socket";
import { useStore } from "./store/useStore";
import { getLocalStream } from "./webrtc/media";
import {
  createPeerConnection,
  getPeerConnection,
} from "./webrtc/peer";
import "./styles/globals.css";

export default function App() {
  useEffect(() => {
    initSocket();

    const { checkBackendHealth, loadAnalyticsFromBackend } = useStore.getState();
    checkBackendHealth();
    loadAnalyticsFromBackend();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const pushActivity = (entry) => {
      useStore.getState().pushActivity(entry);
    };

    const onCallConnected = (call) => {
      const customerName = call?.customer?.name || call?.phone || "customer";
      pushActivity({
        type: "call",
        text: `Call connected with ${customerName}`,
        time: "Just now",
      });
    };

    const onLeadUpdated = (payload) => {
      const leadName = payload?.customer?.name || payload?.name || "Lead";
      const status = payload?.status || "updated";
      pushActivity({
        type: "status",
        text: `${leadName} updated to ${status}`,
        time: "Just now",
      });
    };

    const onWebRtcOffer = async ({ callId, customer, number, offer }) => {
      if (!offer) return;

      try {
        const peer = createPeerConnection({
          onIceCandidate: (candidate) => {
            socket.emit("webrtc_ice_candidate", {
              callId,
              candidate,
            });
          },
        });

        const stream = await getLocalStream();

        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });

        await peer.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("webrtc_answer", {
          callId,
          answer,
        });

        const displayName = customer?.name || number || "WebRTC caller";

        useStore.setState({
          agentAvailability: "On Call",
          isCalling: false,
          callingNumber: "",
          callError: "",
          activeCall: {
            id: callId,
            leadId: customer?.id || customer?._id || null,
            name: displayName,
            company: customer?.company || "WebRTC Call",
            number: number || customer?.phone || "Unknown number",
            startedAt: Date.now(),
            muted: false,
            onHold: false,
            transport: "webrtc",
          },
        });

        pushActivity({
          type: "call",
          text: `WebRTC call connected with ${displayName}`,
          time: "Just now",
        });
      } catch (error) {
        console.error("Failed to handle WebRTC offer:", error);
        pushActivity({
          type: "status",
          text: "Unable to accept WebRTC call. Check microphone permission.",
          time: "Just now",
        });
      }
    };

    const onWebRtcAnswer = async ({ answer }) => {
      if (!answer) return;

      try {
        const peer = getPeerConnection();
        if (!peer) return;

        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error("Failed to handle WebRTC answer:", error);
      }
    };

    const onWebRtcIceCandidate = async ({ candidate }) => {
      if (!candidate) return;

      try {
        const peer = getPeerConnection();
        if (!peer) return;

        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Failed to add WebRTC ICE candidate:", error);
      }
    };

    const onWebRtcCallEnded = () => {
      useStore.getState().clearWebRtcCall();
      pushActivity({
        type: "call",
        text: "Remote WebRTC call ended",
        time: "Just now",
      });
    };

    socket.on("call_connected", onCallConnected);
    socket.on("lead_updated", onLeadUpdated);
    socket.on("webrtc_offer", onWebRtcOffer);
    socket.on("webrtc_answer", onWebRtcAnswer);
    socket.on("webrtc_ice_candidate", onWebRtcIceCandidate);
    socket.on("webrtc_call_ended", onWebRtcCallEnded);

    return () => {
      socket.off("call_connected", onCallConnected);
      socket.off("lead_updated", onLeadUpdated);
      socket.off("webrtc_offer", onWebRtcOffer);
      socket.off("webrtc_answer", onWebRtcAnswer);
      socket.off("webrtc_ice_candidate", onWebRtcIceCandidate);
      socket.off("webrtc_call_ended", onWebRtcCallEnded);
    };
  }, []);

  return <Dashboard />;
}
