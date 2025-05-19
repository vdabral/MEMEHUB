import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cleans up AI-generated meme captions by removing leading '>', quotes, and whitespace.
 * Also strips leading asterisks, dashes, and common markdown bullets.
 */
export function cleanCaption(caption: string): string {
  return caption
    .replace(/^\s*[>*\-\"]+\s*/g, '') // Remove leading >, *, -, ", and whitespace
    .replace(/^['"]+|['"]+$/g, '')      // Remove leading/trailing quotes
    .replace(/^\s+|\s+$/g, '')          // Trim whitespace
}
