import { GoogleGenAI, Modality, Type } from "@google/genai";

export const GEMINI_MODEL = "gemini-3-flash-preview";
export const VEO_MODEL = "veo-3.1-fast-generate-preview";

export async function generateYouTubeDescription(url: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `Analyze the following YouTube video URL: ${url}. Based on the video content, including the title, description, and visual elements, create a comprehensive and engaging YouTube video description. The description should:

1. Clearly state the video's main topic and purpose.
2. Highlight key moments and interesting details from the video.
3. Use relevant keywords to improve searchability.
4. Include a call to action, encouraging viewers to like, subscribe, and share.
5. Maintain a tone that matches the video's style (e.g., informative, humorous, educational).
6. Structure the description into clear, readable paragraphs.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text;
}

export async function startVideoGeneration(prompt: string, aspectRatio: "16:9" | "9:16") {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const operation = await ai.models.generateVideos({
    model: VEO_MODEL,
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: "1080p",
      aspectRatio: aspectRatio,
    },
  });

  return operation;
}

export async function pollVideoOperation(operationId: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const operation = await ai.operations.getVideosOperation({ operation: operationId });
  return operation;
}

export async function fetchVideoBlob(url: string) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-goog-api-key': process.env.GEMINI_API_KEY || '',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch video');
  return await response.blob();
}

export async function suggestKeywords(theme?: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = theme 
    ? `Based on current YouTube trends and SEO data for the theme "${theme}", suggest 5-7 highly searchable, low-competition keywords or keyphrases for a faceless YouTube channel. Provide the keyword and a brief explanation of why it is relevant for YouTube SEO and the current algorithm.`
    : `Based on current YouTube trends and SEO data, suggest 5-7 highly searchable, trending keywords or keyphrases for a faceless YouTube channel in the tech, science, or mystery niches. Provide the keyword and a brief explanation of why it is relevant for YouTube SEO and the current algorithm.`;
  
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            keyword: { type: Type.STRING, description: "The suggested keyword or keyphrase." },
            explanation: { type: Type.STRING, description: "Brief explanation of why this is relevant for YouTube SEO." }
          },
          required: ["keyword", "explanation"]
        }
      }
    },
  });
  
  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
}

export async function generateTags(topic: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Based on current YouTube trends and SEO data for the topic "${topic}", suggest exactly 10 highly searchable tags for a YouTube video. Return ONLY a comma-separated list of the tags, nothing else.`;
  
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return response.text?.split(',').map(t => t.trim()).filter(Boolean) || [];
}

export async function generateConcepts(keywords: string, theme: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Based on the keywords: ${keywords}, brainstorm 5 unique, visually captivating video concepts for an anonymous YouTube channel. The concepts should explore the themes of ${theme}. Output each concept with a title and a brief, evocative description (50-75 words).`;
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The title of the video concept" },
            description: { type: Type.STRING, description: "A brief, evocative description of the video concept" }
          },
          required: ["title", "description"]
        }
      }
    }
  });
  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
}

export async function generateScriptOutline(concept: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `For the video concept: ${concept}, create a detailed scene-by-scene outline. Include key visual cues (e.g., 'Atmospheric shot of a neon-lit cityscape' or 'Close-up on glowing bioluminescent creature'), potential voice-over cues (if any), and estimated scene durations (10-20 seconds per scene).`;
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });
  return response.text;
}

export async function generateVoiceOver(script: string, voiceName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: script }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });
  
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Failed to generate audio");
  
  return `data:audio/wav;base64,${base64Audio}`;
}

export async function generateThumbnail(title: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `A highly engaging, click-worthy YouTube thumbnail background for a video titled: "${title}". Cinematic lighting, vibrant colors, high contrast, intriguing visual hook. No text in the image.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: prompt,
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate thumbnail image.");
}

export async function runAllTests() {
  const results: any = {};
  
  try {
    results.keywords = await suggestKeywords("cyberpunk");
    
    const concepts = await generateConcepts("cyberpunk, AI, future cities", "human-machine interaction");
    results.concepts = concepts;
    
    if (concepts && concepts.length > 0) {
      results.outline = await generateScriptOutline(`${concepts[0].title}\n\n${concepts[0].description}`);
    }
    
    results.tags = await generateTags("cyberpunk future cities");
    
    // Note: We skip video generation, voice over, and thumbnail generation in this automated test 
    // to avoid long wait times and excessive API usage, but the text-based endpoints are verified.
    
    return results;
  } catch (e: any) {
    throw new Error(`Test failed: ${e.message}`);
  }
}
