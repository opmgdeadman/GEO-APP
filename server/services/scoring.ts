export interface ScoringResult {
  geo_score: number;
  entity_score: number;
  structure_score: number;
  citation_score: number;
  clarity_score: number;
  formatting_score: number;
  metrics: {
    word_count: number;
    header_count: number;
    faq_presence: boolean;
    outbound_link_count: number;
    entity_frequency: number;
    paragraph_count: number;
    average_sentence_length: number;
  };
}

export function calculateScores(text: string, topic: string): ScoringResult {
  const word_count = text.split(/\s+/).length;
  const header_count = (text.match(/^#{1,6}\s/gm) || []).length; // Markdown headers
  const faq_presence = /FAQ|Frequently Asked Questions/i.test(text);
  const outbound_link_count = (text.match(/https?:\/\/[^\s]+/g) || []).length;
  const paragraph_count = text.split(/\n\s*\n/).length;
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const average_sentence_length = sentences.length > 0 
    ? word_count / sentences.length 
    : 0;

  // Simple entity frequency (count occurrences of topic words)
  const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  let entity_frequency = 0;
  if (topicWords.length > 0) {
    const regex = new RegExp(topicWords.join('|'), 'gi');
    entity_frequency = (text.match(regex) || []).length;
  }

  // Normalize scores (0-100)
  
  // Entity Score: Based on frequency relative to length (keyword density)
  // Target density around 1-2%
  const density = entity_frequency / (word_count || 1);
  let entity_score = Math.min(100, Math.max(0, (density * 100) * 50)); // Simplified heuristic
  if (entity_frequency === 0) entity_score = 0;

  // Structure Score: Headers and FAQ
  let structure_score = Math.min(100, (header_count * 10) + (faq_presence ? 20 : 0));

  // Citation Score: Outbound links
  let citation_score = Math.min(100, outbound_link_count * 20);

  // Clarity Score: Sentence length (shorter is better, target 15-20 words)
  let clarity_score = 100;
  if (average_sentence_length > 25) clarity_score = 60;
  if (average_sentence_length > 35) clarity_score = 40;
  if (average_sentence_length < 10) clarity_score = 80; // Too short?

  // Formatting Score: Paragraphs (readability)
  let formatting_score = Math.min(100, paragraph_count * 10);

  // Weighted Total
  const geo_score = Math.round(
    (0.2 * entity_score) +
    (0.2 * structure_score) +
    (0.2 * citation_score) +
    (0.2 * clarity_score) +
    (0.2 * formatting_score)
  );

  return {
    geo_score,
    entity_score,
    structure_score,
    citation_score,
    clarity_score,
    formatting_score,
    metrics: {
      word_count,
      header_count,
      faq_presence,
      outbound_link_count,
      entity_frequency,
      paragraph_count,
      average_sentence_length
    }
  };
}
