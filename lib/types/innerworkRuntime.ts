export interface InnerworkRecommendation {
  module: string;
  suggestion: string;
  reasoning: string;
}

export interface InnerworkRuntimeData {
  recommendations: InnerworkRecommendation[];
}
