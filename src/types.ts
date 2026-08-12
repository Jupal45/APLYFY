/**
 * Types for AuraText - Liquid Glass Word Processor
 */

export interface Document {
  id: string;
  title: string;
  content: string; // HTML content from editable area
  plainText: string;
  createdAt: number;
  updatedAt: number;
  fontFamily: string;
  fontSize: string;
  wordCount: number;
  charCount: number;
}

export interface UserAccount {
  id: string;
  name: string;
  passwordHash: string; // Stored hash or password for verification
  profilePicUrl: string; // Data URL or avatar URL imported from user device
  createdAt: number;
  updatedAt: number;
  documents: Document[];
}

export interface QRVaultPayload {
  version: "1.0";
  v: "AuraTextVault";
  u: {
    id: string;
    n: string; // name
    p: string; // password
    pic: string; // profile pic data url
    d: Array<{
      id: string;
      t: string; // title
      c: string; // content
      f?: string; // font family
      s?: string; // font size
      ca: number; // created at
      ua: number; // updated at
    }>;
  };
}

export type ActiveScreen = 'welcome' | 'register' | 'login' | 'lobby' | 'editor';
