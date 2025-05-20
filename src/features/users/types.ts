export interface User {
  id: string;
  username: string;
  credits: number;
  boosts?: number;
  avatar?: string;
  bio?: string;
}
