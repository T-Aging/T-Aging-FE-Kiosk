import { useState } from "react";
import axios from "axios";

export const useTTS = () => {
  const [, setAudio] = useState<HTMLAudioElement | null>(null);

  const playTTS = async (text: string) => {
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
          responseType: "arraybuffer", // Blob 대신 arraybuffer로 받아야 함
        }
      );

      /** ArrayBuffer → Blob */
      const blob = new Blob([res.data], { type: "audio/mpeg" });

      /** Blob → 객체 URL */
      const url = URL.createObjectURL(blob);

      /** 오디오 재생 */
      const audioElement = new Audio(url);
      setAudio(audioElement);
      audioElement.play();

      /** 끝나면 메모리에서 삭제 */
      audioElement.onended = () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error("TTS axios 오류", err);
    }
  };

  return { playTTS };
};
