import { GoogleGenAI, Modality } from "@google/genai";
import { UploadType, Style, Genre, ProcessedImage } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  const base64Data = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
};

const getPrompt = (uploadType: UploadType, style: Style, genre: Genre): string => {
  if (uploadType === 'panel') {
    return `Colorize this black-and-white manga panel in a ${style}, ${genre} style. Ensure the entire panel is fully colored with no uncolored areas. Preserve all original line art, details, textures, and composition. Apply dynamic, anime-style shading, lighting, highlights, and any relevant special effects (like motion lines, energy glows, magic effects, blood, gore, etc.) appropriate for the scene. Every single pixel must be colored. The output must be a high-resolution, high-quality colored manga panel.`;
  } else {
    return `Act as an expert manga artist. Convert this photo into a manga-style panel. The final output must look like a true manga panel.
**Key requirements:**
1. **Preserve Content:** The person’s face, pose, and background must be preserved exactly from the original photo.
2. **Apply Manga Style:** Convert the photo using manga line art, black-and-white or shaded textures, screen tones, and manga-style shading.
3. **Adapt to User's Choice:** The style must be **${style}** and the genre **${genre}**. Fully adapt the line art, textures, effects, and panel composition to match this selection. Add panel elements like borders, speed lines, or motion lines if appropriate for the style.
4. **Strict Prohibition:** Do NOT output realistic colors or any photorealistic effects.
5. **Quality:** The output must be complete, high-resolution, and fully faithful to the original photo’s composition.`;
  }
};

export const processImage = async (file: File, uploadType: UploadType, style: Style, genre: Genre): Promise<ProcessedImage> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(file);
  const textPart = { text: getPrompt(uploadType, style, genre) };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  
  if (!parts) {
    console.error("Gemini API Response Error:", response);
    throw new Error('Image generation failed. The API returned no content.');
  }

  const generatedPart = parts.find(part => part.inlineData);

  if (generatedPart && generatedPart.inlineData) {
    const originalUrl = URL.createObjectURL(file);
    const generatedUrl = `data:${generatedPart.inlineData.mimeType};base64,${generatedPart.inlineData.data}`;
    return { originalUrl, generatedUrl };
  } else {
    const textResponse = parts.find(part => part.text)?.text;
    console.error("Gemini API Response Error. No image data found. Text response:", textResponse, "Full response:", response);
    throw new Error('Image generation failed or API response is malformed.');
  }
};

export const processImageBatch = async (files: File[], uploadType: UploadType, style: Style, genre: Genre): Promise<ProcessedImage[]> => {
    const promises = files.map(file => processImage(file, uploadType, style, genre));
    return Promise.all(promises);
}