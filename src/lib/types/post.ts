export type Post = {
    id: string;
    mediaType: 'video' | 'image';
    mediaUrl: string;
    title: string;
    description?: string;
  };
  