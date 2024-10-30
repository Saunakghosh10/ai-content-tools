export interface KeywordResponse {
  keywords?: Keyword[];
  error?: string;
}

export interface Keyword {
  keyword: string;
  category: string;
}
