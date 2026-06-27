export type ContentType = 'link' | 'note' | 'tweet' | 'video' | 'thought';

export interface User {
  _id: string;
  username: string;
}

export interface ContentItem {
  _id: string;
  title: string;
  type: ContentType;
  link?: string;
  description?: string;
  tags?: string[];
  tag?: string; 
  userId: {
    _id: string;
    username: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SidebarItem {
  id: string;
  name: string;
  icon: any; 
}
