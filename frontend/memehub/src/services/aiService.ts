// AI utility for meme caption and tag generation (frontend)

import { api } from './api';

type CaptionResponse = { caption: string };
type TagsResponse = { tags: string[] };

export async function getAICaption(imageUrl: string): Promise<string> {
  const { caption } = await api.post<CaptionResponse>('/ai/caption', { imageUrl });
  return caption;
}

export async function getAITags(text: string): Promise<string[]> {
  const { tags } = await api.post<TagsResponse>('/ai/tags', { text });
  return tags;
}
