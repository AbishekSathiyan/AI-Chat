// types.ts
export enum Sender {
    User = 'user',
    Bot = 'bot',
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  sources?: GroundingSource[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}
