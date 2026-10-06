/**
 * Vector service – now uses random vectors only (no external API).
 * This avoids any API key or model issues and allows the seed to run.
 */

/**
 * Generate a random embedding vector (768 dimensions)
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  // Immediately return a random vector without any API call
  return Array.from({ length: 768 }, () => +(Math.random() * 2 - 1).toFixed(4));
};

/**
 * Generate embeddings for multiple texts in batch (random)
 */
export const generateBatchEmbeddings = async (texts: string[]): Promise<number[][]> => {
  return texts.map(() => 
    Array.from({ length: 768 }, () => +(Math.random() * 2 - 1).toFixed(4))
  );
};

/**
 * Generate product description text for embedding (kept for compatibility)
 */
export const getProductEmbeddingText = (product: any): string => {
  return `${product.name} ${product.brand} ${product.category} ${product.description} ${product.tags?.join(' ') || ''}`.trim();
};

/**
 * Generate a query embedding for search (random)
 */
export const generateQueryEmbedding = async (query: string): Promise<number[]> => {
  return generateEmbedding(query);
};

/**
 * Validate vector dimensions (always true for random vectors)
 */
export const validateVectorDimensions = (vector: number[]): boolean => {
  return vector.length === 768;
};