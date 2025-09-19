export type Team = "offense" | "defense";

export type PlayerTokenType = {
  id: string;
  team: Team;
  number: 1 | 2 | 3 | 4 | 5;
  x: number;
  y: number;
};
