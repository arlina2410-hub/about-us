export interface Poem {
  id: string;
  title: string;
  date: string;
  category?: string;
  tags?: string[];
  stanzas: string[][];
  featured?: boolean;
}
