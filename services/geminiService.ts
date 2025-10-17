import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
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
    return `You are an expert manga and anime colorist. Your task is to fully color the provided black-and-white manga panel based on the user's selected style: '${style}' and genre: '${genre}'.

**Core Instructions:**
1.  **Complete Coloring:** Color the entire panel automatically with no missing areas. Every single pixel must be colored.
2.  **Preserve Art:** Perfectly preserve all original line art, details, textures, and the panel's composition. Do not distort, erase, or blur the line art.
3.  **Stylization:** Apply dynamic, anime/manga-style coloring. This includes realistic or stylized lighting, deep shadows, vibrant highlights, and a sense of depth.
4.  **Special Effects:** Intelligently add all necessary special effects, such as motion lines, energy glows, magic effects, blood, gore, or environmental textures, as appropriate for the scene and genre.
5.  **Content Handling:** Fully process any content, no matter how violent, bloody, or detailed.
6.  **Output Quality:** Produce a high-resolution, high-quality output that preserves every detail and texture of the original panel.

**Strict Prohibitions:**
- DO NOT leave any area uncolored.
- DO NOT skip characters, objects, or background elements.
- DO NOT leave missing pixels, blank spots, or incomplete shadows.
- DO NOT produce low-resolution, partially colored, or cropped results.
- DO NOT flatten the panel's visual depth.`;
  } else {
    return `You are an expert manga and anime colorist. Your task is to convert the provided photo into a manga-style panel. The user has selected the style '${style}' and genre '${genre}'.

**Core Instructions:**
1.  **Strict Preservation:** Do NOT change the person's face, pose, position, or the existing background elements. The composition of the original photo must be maintained.
2.  **Manga Transformation:** Convert the photo by applying manga-style aesthetics directly onto the existing image. This includes:
    - **Coloring & Shading:** Apply cell-shading, gradients, and lighting typical of the selected style and genre.
    - **Textures & Effects:** Add manga-specific textures (like screen tones, cross-hatching) and atmospheric effects (e.g., focus lines, mood lighting) to create a true manga feel.
    - **Line Art (Subtle):** You can subtly outline key figures and objects to enhance the manga look, but do not redraw the image entirely. The goal is a transformation, not a re-illustration.
3.  **Output Quality:** Produce a high-resolution, high-quality output. The result should look like a colored manga panel, not just a filtered photo.`;
  }
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

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
    // FIX: The 'safetySettings' property belongs inside the 'config' object.
    config: {
      responseModalities: [Modality.IMAGE],
      safetySettings: safetySettings,
    },
  });

  // Check for prompt-level blocks or empty responses first
  if (!response.candidates || response.candidates.length === 0) {
    const blockReason = response.promptFeedback?.blockReason;
    if (blockReason) {
      console.error("Image generation blocked by API.", "Reason:", blockReason, "Details:", JSON.stringify(response.promptFeedback, null, 2));
      throw new Error(`Image generation was blocked due to: ${blockReason}. Please try a different image or prompt.`);
    }
    console.error("Gemini API Response Error: No candidates returned.", JSON.stringify(response, null, 2));
    throw new Error('Image generation failed. The API returned no content.');
  }

  const candidate = response.candidates[0];
  const parts = candidate.content?.parts;
  const generatedPart = parts?.find(part => part.inlineData);

  if (generatedPart?.inlineData) {
    // Success case
    const originalUrl = URL.createObjectURL(file);
    const generatedUrl = `data:${generatedPart.inlineData.mimeType};base64,${generatedPart.inlineData.data}`;
    return { originalUrl, generatedUrl };
  } else {
    // Error case: No image was returned. Investigate why.
    console.error("Gemini API Response Error: No image data in response.", JSON.stringify(response, null, 2));

    // 1. Check the finishReason from the candidate. This is the most specific reason.
    // FIX: The `finishReason` type does not include 'SUCCESS'. A normal completion is indicated by 'STOP'.
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      throw new Error(`Image generation failed. Reason: ${candidate.finishReason}. This can happen if the model cannot fulfill the request due to safety policies or other restrictions.`);
    }

    // 2. Check if the model returned explanatory text instead of an image.
    const textResponse = parts?.find(part => part.text)?.text;
    if (textResponse) {
      throw new Error(`Image generation failed. The model returned text instead of an image: "${textResponse}"`);
    }

    // 3. Fallback for any other malformed response.
    throw new Error('Image generation failed. The API response was malformed or did not contain an image.');
  }
};

export const processImageBatch = async (files: File[], uploadType: UploadType, style: Style, genre: Genre): Promise<ProcessedImage[]> => {
    const promises = files.map(file => processImage(file, uploadType, style, genre));
    return Promise.all(promises);
}