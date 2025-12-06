import { useRef } from "react";
import axios from "axios";

export const useTTS = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTTS = async (text: string, onDone?: () => void) => {
    try {
      const res = await axios.post(
        "https://api.openai.com/v1/audio/speech",
        {
          model: "gpt-4o-mini-tts",
          voice: "sage",
          input: text,
          format: "mp3",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([res.data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      // 기존 TTS 재생 중이면 즉시 중단
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        onDone?.();
      };
    } catch (err) {
      console.error("TTS axios 오류", err);
    }
  };

  // TTS 즉시 중단 기능
  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  return { playTTS, stopTTS };
};
