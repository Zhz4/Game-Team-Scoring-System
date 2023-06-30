export interface Team {
  id: string;
  name: string;
  color: string;
  member: Array<string>;
  score: number;
}

export interface Member {
  nickname: string;
  rank: string;
}
