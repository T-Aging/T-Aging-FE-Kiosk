import axios from "axios";

export const useSTT = () => {
  const playSTT  = async (blob: Blob): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", blob, "voice.webm");
      formData.append("model", "gpt-4o-transcribe"); 

      const res = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
        }
      );
      console.log("STT Response:", res.data);

      return res.data.text ?? null;
    } catch (err) {
      console.error("STT 오류:", err);
      return null;
    }
  };

  return { playSTT };
};
