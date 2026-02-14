
export enum ElementType {
  TITLE = 'title',
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  IMAGE = 'image',
  QUOTE = 'quote',
  LIST = 'list',
  SHAPE = 'shape'
}

export interface ElementStyle {
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

export interface EbookElement {
  id: string;
  type: ElementType;
  content: string;
  x: number;
  y: number;
  w: number;
  h: number;
  style: ElementStyle;
}

export interface EbookPage {
  id: string;
  elements: EbookElement[];
  templateId?: string;
  backgroundColor: string;
}

export interface Ebook {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  pages: EbookPage[];
  createdAt: string;
  status: 'draft' | 'published';
}

export interface GenerationConfig {
  topic: string;
  audience: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  style: string;
}

export interface EbookOutline {
  title: string;
  subtitle: string;
  chapters: {
    title: string;
    subsections: string[];
    keyPoints: string[];
  }[];
}
