# Article Clustering Implementation Options

**Version:** 1.0  
**Date:** January 27, 2026  
**Purpose:** Research document exploring approaches to cluster similar news articles for contextual event coverage

---

## Executive Summary

This document evaluates multiple approaches for clustering news articles to provide readers with multi-perspective coverage of the same events. Based on the current schema (Article with title, description, keywords, url, publishedAt; Cluster with topic, mainEntity, firstSeenAt), we analyze:

1. **Keyword-based clustering** (extraction from article metadata)
2. **LLM-based clustering** (semantic understanding and grouping)
3. **Embedding-based similarity** (vector representations)
4. **Named Entity Recognition (NER)** clustering (extracting entities like locations, people, organizations)
5. **Temporal + keyword hybrid** (time-windowed topic detection)

**Recommendation:** Start with a **hybrid approach** combining NER-based entity extraction with temporal windowing, then enhance with embedding-based similarity for better precision. This balances cost, accuracy, and implementation complexity.

---

## Current System Context

### Database Schema (Existing)

```prisma
model Article {
  id          String    @id @default(uuid())
  title       String
  description String?
  url         String    @unique
  imageUrl    String?
  publishedAt DateTime
  sourceId    String
  source      Source    @relation(fields: [sourceId], references: [id])
  clusterId   String?
  cluster     Cluster?  @relation(fields: [clusterId], references: [id])
  keywords    String[]  // Already extracted via extractKeywords()
  
  @@index([publishedAt])
  @@index([clusterId])
}

model Cluster {
  id          String    @id @default(uuid())
  topic       String
  mainEntity  String    // Primary subject
  firstSeenAt DateTime
  articles    Article[]
  
  @@index([firstSeenAt])
}
```

### Current Keyword Extraction

The system already extracts keywords from article titles and descriptions:
- Filters common stop words
- Extracts 3+ character words
- Returns up to 10 unique keywords per article
- **Location:** `V2/lib/news/article-utils.ts`

This provides a foundation for keyword-based clustering but has limitations (synonyms, context, semantic meaning).

---

## Option 1: Keyword-Based Clustering

### Overview

Cluster articles by identifying shared high-value keywords (locations, government agencies, events, people). This was one of the original ideas proposed.

### Implementation Strategy

#### A. Simple Keyword Overlap

**Algorithm:**
1. For each new article, extract keywords (already done)
2. Compare keywords against existing clusters
3. If overlap threshold met (e.g., 3+ shared keywords), add to cluster
4. Otherwise, create new cluster

```typescript
interface KeywordClusteringConfig {
  minSharedKeywords: number; // e.g., 3
  timeWindowHours: number;    // e.g., 48 (only cluster recent articles)
  minClusterSize: number;     // e.g., 2 articles minimum
}

async function clusterByKeywords(article: Article): Promise<Cluster> {
  const recentClusters = await prisma.cluster.findMany({
    where: {
      firstSeenAt: {
        gte: new Date(Date.now() - config.timeWindowHours * 3600000)
      }
    },
    include: {
      articles: {
        select: { keywords: true }
      }
    }
  });

  for (const cluster of recentClusters) {
    const clusterKeywords = new Set(
      cluster.articles.flatMap(a => a.keywords)
    );
    
    const sharedKeywords = article.keywords.filter(
      k => clusterKeywords.has(k)
    );
    
    if (sharedKeywords.length >= config.minSharedKeywords) {
      return cluster; // Add to existing cluster
    }
  }
  
  // Create new cluster
  return prisma.cluster.create({
    data: {
      topic: article.keywords.slice(0, 3).join(' '),
      mainEntity: article.keywords[0],
      firstSeenAt: article.publishedAt
    }
  });
}
```

#### B. TF-IDF Weighted Keyword Clustering

Use term frequency-inverse document frequency to identify important keywords:

```typescript
function calculateTFIDF(articles: Article[]): Map<string, number> {
  const termFrequency = new Map<string, number>();
  const docCount = new Map<string, number>();
  
  // Calculate term frequencies
  articles.forEach(article => {
    const uniqueKeywords = new Set(article.keywords);
    uniqueKeywords.forEach(keyword => {
      termFrequency.set(
        keyword, 
        (termFrequency.get(keyword) || 0) + 1
      );
      docCount.set(
        keyword,
        (docCount.get(keyword) || 0) + 1
      );
    });
  });
  
  // Calculate TF-IDF scores
  const tfidf = new Map<string, number>();
  const totalDocs = articles.length;
  
  termFrequency.forEach((tf, term) => {
    const df = docCount.get(term) || 1;
    const idf = Math.log(totalDocs / df);
    tfidf.set(term, tf * idf);
  });
  
  return tfidf;
}
```

### Pros
- ✅ **Zero cost** - no external API calls
- ✅ **Fast execution** - simple string comparison
- ✅ **Transparent** - easy to debug and explain
- ✅ **Already partially implemented** - keywords exist in schema
- ✅ **Privacy-friendly** - no external data sharing

### Cons
- ❌ **Synonym blindness** - "Biden" vs "President" vs "POTUS" treated as different
- ❌ **Context insensitive** - "Trump" (former president) vs "Trump" (card game)
- ❌ **Weak semantic understanding** - misses conceptually similar articles
- ❌ **Stop word reliance** - quality depends on stop word list maintenance
- ❌ **Language specific** - requires different stop words per language

### When to Use
- MVP/initial implementation
- Cost-sensitive deployments
- High-volume processing (1000s of articles/minute)
- Transparent, explainable clustering requirements

### Estimated Accuracy
**60-70%** - Works well for articles with clear overlapping keywords (e.g., "Trump indictment trial") but struggles with synonyms and paraphrasing.

**References:**
- Salton, G., & Buckley, C. (1988). "Term-weighting approaches in automatic text retrieval." *Information Processing & Management*
- Manning, C.D., Raghavan, P., & Schütze, H. (2008). *Introduction to Information Retrieval*, Chapter 6: Scoring, term weighting

---

## Option 2: LLM-Based Clustering

### Overview

Use a Large Language Model (e.g., OpenAI GPT-4, Claude, or open-source alternatives) to understand article semantics, extract storylines, and group articles intelligently. This was the second original idea proposed.

### Implementation Strategy

#### A. Batch Analysis with Storyline Extraction

Send article titles to an LLM and ask it to identify storylines:

```typescript
interface LLMClusteringConfig {
  model: string;              // e.g., "gpt-4o-mini"
  maxArticlesPerBatch: number; // e.g., 50
  minArticlesPerCluster: number; // e.g., 3
}

async function clusterWithLLM(
  articles: Article[]
): Promise<Map<string, Article[]>> {
  const titles = articles.map(a => ({ id: a.id, title: a.title }));
  
  const prompt = `You are analyzing news articles to identify storylines. 
  
Given these ${titles.length} article titles, identify groups of articles covering 
the same event or storyline. Each group must have at least ${config.minArticlesPerCluster} articles.

Return a JSON array of clusters in this format:
[
  {
    "topic": "Brief topic description",
    "mainEntity": "Primary subject (person, place, or event)",
    "articleIds": ["id1", "id2", "id3"]
  }
]

Article titles:
${titles.map(t => `${t.id}: ${t.title}`).join('\n')}`;

  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1  // Low temperature for consistency
  });
  
  const clusters = JSON.parse(response.choices[0].message.content);
  return groupArticlesByClusters(articles, clusters);
}
```

#### B. Incremental Article Addition

For each new article, query the LLM whether it belongs to existing clusters:

```typescript
async function findClusterForArticle(
  article: Article,
  existingClusters: Cluster[]
): Promise<Cluster | null> {
  const clusterDescriptions = existingClusters.map(c => 
    `Cluster ${c.id}: ${c.topic} (Main entity: ${c.mainEntity})`
  ).join('\n');
  
  const prompt = `Article: "${article.title}"
  
Existing story clusters:
${clusterDescriptions}

Does this article belong to any existing cluster? If yes, return the cluster ID. 
If no, return "NEW". Respond with just the cluster ID or "NEW".`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });
  
  const answer = response.choices[0].message.content.trim();
  
  if (answer === "NEW") return null;
  return existingClusters.find(c => c.id === answer) || null;
}
```

#### C. Summary Generation

LLMs can also generate cluster summaries:

```typescript
async function generateClusterSummary(
  cluster: Cluster,
  articles: Article[]
): Promise<string> {
  const titles = articles.map(a => `- ${a.title}`).join('\n');
  
  const prompt = `Summarize this news storyline in 2-3 sentences:

${titles}

Focus on: what happened, when, who was involved, and why it matters.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150
  });
  
  return response.choices[0].message.content;
}
```

### Cost Analysis

**OpenAI GPT-4o-mini pricing (as of Jan 2026):**
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Estimation for 1000 articles/day:**
- Batch clustering (50 articles at a time): ~20 API calls
- Average tokens per call: ~2000 input, ~500 output
- Daily cost: 20 × (2000×$0.15 + 500×$0.60) / 1M ≈ **$0.012/day** or **$3.60/month**

**For incremental checking:**
- 1000 articles × ~200 tokens per check
- Monthly cost: ~30 × 1000 × 200 × $0.15 / 1M ≈ **$0.90/month**

**Total estimated cost:** $5-10/month for moderate traffic

**Alternative: Self-hosted LLMs**
- Llama 3.1 8B (via Ollama or vLLM)
- Mistral 7B
- Cost: Infrastructure only (~$50-200/month for GPU instance)

### Pros
- ✅ **High accuracy** - understands semantics and context
- ✅ **Handles synonyms** - "President Biden" = "Joe Biden" = "Biden administration"
- ✅ **Multi-lingual** - works across languages without configuration
- ✅ **Can generate summaries** - bonus feature for user experience
- ✅ **Flexible** - can adapt prompts for different clustering strategies
- ✅ **Handles paraphrasing** - recognizes same story told differently

### Cons
- ❌ **API costs** - ongoing expense (though low with mini models)
- ❌ **Latency** - API calls add 1-3 seconds per batch
- ❌ **Rate limits** - may hit API rate limits with high traffic
- ❌ **Reliability dependency** - requires external service availability
- ❌ **Prompt engineering** - quality depends on prompt design
- ❌ **Non-deterministic** - same input may yield slightly different results
- ❌ **Privacy concerns** - sending article data to third-party service

### When to Use
- Moderate article volume (< 10k articles/day)
- Budget allows $10-50/month for AI services
- Accuracy is critical
- Multi-lingual support needed
- Want cluster summaries or explanations

### Estimated Accuracy
**85-92%** - Significantly better than keyword-based, especially with synonyms and paraphrasing. GPT-4o would be higher (90-95%) but costs more.

**References:**
- Brown, T., et al. (2020). "Language Models are Few-Shot Learners." *NeurIPS*
- OpenAI API Documentation: https://platform.openai.com/docs/guides/text-generation
- Zhang, T., et al. (2023). "Benchmarking Large Language Models for News Article Understanding." *arXiv:2304.01373*

---

## Option 3: Embedding-Based Similarity (Semantic Vectors)

### Overview

Convert article text into high-dimensional vectors (embeddings) that capture semantic meaning, then cluster based on vector similarity (cosine distance).

### Implementation Strategy

#### A. Generate Embeddings

Use OpenAI's text-embedding-3-small model or open-source alternatives:

```typescript
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 512  // Smaller = faster, 512-1536 recommended
  });
  
  return response.data[0].embedding;
}

async function embedArticles(articles: Article[]): Promise<void> {
  for (const article of articles) {
    const text = `${article.title}. ${article.description || ''}`;
    const embedding = await generateEmbedding(text);
    
    // Store in database (requires vector extension like pgvector)
    await prisma.$executeRaw`
      UPDATE "Article" 
      SET embedding = ${JSON.stringify(embedding)}::vector
      WHERE id = ${article.id}
    `;
  }
}
```

#### B. Find Similar Articles

Use cosine similarity or Euclidean distance:

```typescript
async function findSimilarArticles(
  articleId: string,
  threshold: number = 0.85
): Promise<Article[]> {
  // Using pgvector extension for PostgreSQL
  const similar = await prisma.$queryRaw`
    SELECT a.*, 
           1 - (a.embedding <=> target.embedding) AS similarity
    FROM "Article" a,
         (SELECT embedding FROM "Article" WHERE id = ${articleId}) target
    WHERE 1 - (a.embedding <=> target.embedding) > ${threshold}
      AND a.id != ${articleId}
    ORDER BY similarity DESC
    LIMIT 20
  `;
  
  return similar;
}
```

#### C. Clustering Algorithm (DBSCAN or K-Means)

```typescript
import { DBSCAN } from 'density-clustering';

function clusterEmbeddings(
  articles: Article[],
  embeddings: number[][]
): Map<number, Article[]> {
  const dbscan = new DBSCAN();
  
  // epsilon: max distance for two points to be neighbors
  // minPoints: minimum cluster size
  const clusters = dbscan.run(embeddings, 0.3, 3);
  
  const clusterMap = new Map<number, Article[]>();
  
  clusters.forEach((clusterIndices, clusterIndex) => {
    const clusterArticles = clusterIndices.map(i => articles[i]);
    clusterMap.set(clusterIndex, clusterArticles);
  });
  
  return clusterMap;
}
```

#### D. Schema Extension

Add vector support to Prisma schema:

```prisma
model Article {
  // ... existing fields
  embedding Unsupported("vector(512)")? // Requires pgvector extension
}
```

Enable pgvector in PostgreSQL:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Cost Analysis

**OpenAI text-embedding-3-small:**
- $0.02 per 1M tokens
- Average article: ~100 tokens
- 1000 articles/day: 100k tokens/day
- Monthly cost: 30 × 100k × $0.02 / 1M ≈ **$0.06/month**

**Storage cost:**
- 512-dimensional vector = ~2KB per article
- 100k articles = ~200MB
- Database storage: negligible

**Alternative: Self-hosted embeddings**
- Sentence-BERT models (all-MiniLM-L6-v2)
- BGE (BAAI General Embedding) models
- Cost: Infrastructure only, no per-request fees

### Pros
- ✅ **Excellent accuracy** - captures semantic meaning
- ✅ **Scalable** - vector search is highly optimized
- ✅ **Fast clustering** - once embedded, clustering is quick
- ✅ **Works across languages** - multilingual embedding models available
- ✅ **Low API cost** - embeddings are cheap
- ✅ **Deterministic** - same input = same embedding
- ✅ **Enables recommendations** - can find "similar articles you might like"

### Cons
- ❌ **Initial embedding cost** - need to embed all existing articles
- ❌ **Database extension required** - pgvector or similar
- ❌ **Storage overhead** - vectors add significant size
- ❌ **Embedding time** - 100-500ms per article with API
- ❌ **Requires clustering algorithm** - DBSCAN, K-Means, or HDBSCAN
- ❌ **Hyperparameter tuning** - epsilon, minPoints require experimentation

### When to Use
- Large article volume (10k+ articles)
- Need high accuracy with scale
- Want to enable "similar articles" recommendations
- Have budget for database with vector support
- Plan to use embeddings for other features (search, recommendations)

### Estimated Accuracy
**88-94%** - Best accuracy for semantic similarity. Comparable to LLMs but more scalable.

**References:**
- Reimers, N., & Gurevych, I. (2019). "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks." *EMNLP*
- Johnson, J., Douze, M., & Jégou, H. (2019). "Billion-scale similarity search with GPUs." *IEEE Transactions on Big Data*
- pgvector documentation: https://github.com/pgvector/pgvector
- OpenAI Embeddings Guide: https://platform.openai.com/docs/guides/embeddings

---

## Option 4: Named Entity Recognition (NER) Clustering

### Overview

Extract named entities (people, organizations, locations, events) from article text and cluster based on entity overlap. This directly addresses the original idea of targeting "locations, events, government agencies."

### Implementation Strategy

#### A. Entity Extraction

Use spaCy (open-source) or cloud NER services:

```typescript
import * as spacy from 'spacy-js';

interface Entity {
  text: string;
  label: string; // PERSON, ORG, GPE (location), EVENT, etc.
  start: number;
  end: number;
}

async function extractEntities(text: string): Promise<Entity[]> {
  const doc = await spacy.nlp(text);
  
  return doc.ents.map(ent => ({
    text: ent.text,
    label: ent.label,
    start: ent.start,
    end: ent.end
  }));
}

// For each article
async function enrichArticleWithEntities(article: Article): Promise<void> {
  const text = `${article.title}. ${article.description || ''}`;
  const entities = await extractEntities(text);
  
  // Store high-value entities
  const highValueEntities = entities.filter(e => 
    ['PERSON', 'ORG', 'GPE', 'EVENT', 'LAW', 'NORP'].includes(e.label)
  );
  
  await prisma.article.update({
    where: { id: article.id },
    data: {
      entities: highValueEntities.map(e => e.text),
      entityTypes: highValueEntities.map(e => e.label)
    }
  });
}
```

#### B. Entity-Based Clustering

```typescript
interface EntityClusteringConfig {
  minSharedEntities: number;     // e.g., 2
  entityWeights: Record<string, number>; // PERSON: 2, ORG: 1.5, GPE: 1
  timeWindowHours: number;
}

async function clusterByEntities(
  article: Article,
  config: EntityClusteringConfig
): Promise<Cluster | null> {
  const recentClusters = await prisma.cluster.findMany({
    where: {
      firstSeenAt: {
        gte: new Date(Date.now() - config.timeWindowHours * 3600000)
      }
    },
    include: {
      articles: {
        select: { entities: true, entityTypes: true }
      }
    }
  });

  let bestMatch: { cluster: Cluster; score: number } | null = null;
  
  for (const cluster of recentClusters) {
    const clusterEntities = new Map<string, string>();
    
    cluster.articles.forEach(a => {
      a.entities.forEach((entity, i) => {
        clusterEntities.set(entity.toLowerCase(), a.entityTypes[i]);
      });
    });
    
    let score = 0;
    article.entities.forEach((entity, i) => {
      const entityKey = entity.toLowerCase();
      if (clusterEntities.has(entityKey)) {
        const entityType = article.entityTypes[i];
        score += config.entityWeights[entityType] || 1;
      }
    });
    
    if (score >= config.minSharedEntities && 
        (!bestMatch || score > bestMatch.score)) {
      bestMatch = { cluster, score };
    }
  }
  
  return bestMatch?.cluster || null;
}
```

#### C. Schema Extension

```prisma
model Article {
  // ... existing fields
  entities     String[]  // e.g., ["Joe Biden", "Congress", "Washington DC"]
  entityTypes  String[]  // e.g., ["PERSON", "ORG", "GPE"]
}
```

### Implementation Options

**Option A: Node.js + spaCy (via Python subprocess)**
```bash
npm install compromise  # Lightweight alternative
# or
npm install wink-nlp   # Another JS option
# or use Python: spacy, transformers (BERT-based NER)
```

**Option B: Cloud NER Services**
- Google Cloud Natural Language API: $1-3 per 1000 documents
- AWS Comprehend: $0.0001 per entity extracted
- Azure Text Analytics: Similar pricing

**Option C: Lightweight JS Libraries**
- compromise.js: Fast, rule-based, works offline
- wink-nlp: Good for English text

### Cost Analysis

**Self-hosted spaCy (Python):**
- Free, open-source
- Requires Python runtime alongside Node.js
- CPU: ~50-100ms per article
- GPU: ~10-20ms per article

**compromise.js (JavaScript):**
- Free, 216KB library
- ~10-30ms per article
- Less accurate than spaCy but good enough for most cases

**Cloud NER:**
- Google Cloud: $1 per 1000 articles
- 30k articles/month: ~$30/month

### Pros
- ✅ **High precision** - focuses on meaningful entities
- ✅ **Explainable** - can show which entities were matched
- ✅ **Addresses original requirement** - specifically targets locations, agencies, people
- ✅ **Language models available** - for multiple languages
- ✅ **Can work offline** - if using local spaCy or compromise
- ✅ **Structured output** - entities are categorized by type

### Cons
- ❌ **NER accuracy varies** - proper nouns can be challenging
- ❌ **Requires NER setup** - Python bridge or cloud service
- ❌ **Entity disambiguation** - "Washington" (person? city? state?)
- ❌ **Processing time** - slower than keyword matching
- ❌ **Maintenance** - NER models need periodic updates

### When to Use
- Want to cluster by specific entity types
- Need explainable clustering (show matched entities)
- Have infrastructure for Python integration
- Articles contain clear entity references
- Want to filter clusters by entity type later

### Estimated Accuracy
**75-85%** - Better than pure keywords due to entity recognition, but can struggle with ambiguous entities and novel names.

**References:**
- Honnibal, M., & Montani, I. (2017). "spaCy 2: Natural language understanding with Bloom embeddings, convolutional neural networks and incremental parsing."
- Li, J., et al. (2020). "A Survey on Deep Learning for Named Entity Recognition." *IEEE TKDE*
- compromise.js documentation: https://github.com/spencermountain/compromise

---

## Option 5: Temporal + Keyword Hybrid (Recommended Starting Point)

### Overview

Combine time-windowed analysis with keyword/entity matching for a balanced approach. This leverages the news cycle pattern where stories emerge, peak, and fade within days.

### Implementation Strategy

#### A. Time-Bucketed Clustering

```typescript
interface TemporalClusteringConfig {
  timeWindowHours: number;      // e.g., 24-48 hours
  minSharedKeywords: number;    // e.g., 3
  keywordSimilarityThreshold: number; // e.g., 0.7
  decayFactor: number;          // Older articles matter less
}

async function temporalKeywordClustering(
  article: Article,
  config: TemporalClusteringConfig
): Promise<Cluster | null> {
  const windowStart = new Date(
    article.publishedAt.getTime() - config.timeWindowHours * 3600000
  );
  
  const recentClusters = await prisma.cluster.findMany({
    where: {
      firstSeenAt: { gte: windowStart }
    },
    include: {
      articles: {
        select: { 
          keywords: true,
          publishedAt: true
        }
      }
    }
  });
  
  for (const cluster of recentClusters) {
    const score = calculateTemporalSimilarity(
      article,
      cluster,
      config
    );
    
    if (score >= config.keywordSimilarityThreshold) {
      return cluster;
    }
  }
  
  return null; // Create new cluster
}

function calculateTemporalSimilarity(
  article: Article,
  cluster: Cluster,
  config: TemporalClusteringConfig
): number {
  // Aggregate cluster keywords with temporal decay
  const clusterKeywordScores = new Map<string, number>();
  const now = article.publishedAt.getTime();
  
  cluster.articles.forEach(a => {
    const ageHours = (now - a.publishedAt.getTime()) / 3600000;
    const decayMultiplier = Math.exp(-ageHours * config.decayFactor);
    
    a.keywords.forEach(keyword => {
      const currentScore = clusterKeywordScores.get(keyword) || 0;
      clusterKeywordScores.set(keyword, currentScore + decayMultiplier);
    });
  });
  
  // Calculate Jaccard similarity with temporal weighting
  const articleKeywordSet = new Set(article.keywords);
  let weightedIntersection = 0;
  
  article.keywords.forEach(keyword => {
    const clusterScore = clusterKeywordScores.get(keyword) || 0;
    weightedIntersection += Math.min(1, clusterScore);
  });
  
  const union = articleKeywordSet.size + clusterKeywordScores.size - 
                weightedIntersection;
  
  return weightedIntersection / union;
}
```

#### B. Trending Topic Detection

Identify emerging topics before they form full clusters:

```typescript
interface TrendingTopic {
  keywords: string[];
  articleCount: number;
  firstSeen: Date;
  momentum: number; // Rate of new articles
}

async function detectTrendingTopics(
  hoursBack: number = 6
): Promise<TrendingTopic[]> {
  const recentArticles = await prisma.article.findMany({
    where: {
      publishedAt: {
        gte: new Date(Date.now() - hoursBack * 3600000)
      }
    },
    select: {
      keywords: true,
      publishedAt: true
    }
  });
  
  // Count keyword co-occurrences in time buckets
  const hourBuckets = new Map<number, Map<string, number>>();
  
  recentArticles.forEach(article => {
    const hourBucket = Math.floor(
      article.publishedAt.getTime() / 3600000
    );
    
    if (!hourBuckets.has(hourBucket)) {
      hourBuckets.set(hourBucket, new Map());
    }
    
    const bucket = hourBuckets.get(hourBucket)!;
    article.keywords.forEach(keyword => {
      bucket.set(keyword, (bucket.get(keyword) || 0) + 1);
    });
  });
  
  // Identify keywords with increasing frequency
  const trending: TrendingTopic[] = [];
  const sortedBuckets = Array.from(hourBuckets.entries())
    .sort((a, b) => a[0] - b[0]);
  
  // Calculate momentum for each keyword
  // ... (implementation details)
  
  return trending;
}
```

#### C. Cluster Lifecycle Management

```typescript
async function updateClusterLifecycle(): Promise<void> {
  const oldClusters = await prisma.cluster.findMany({
    where: {
      firstSeenAt: {
        lt: new Date(Date.now() - 7 * 24 * 3600000) // 7 days old
      }
    },
    include: {
      articles: true
    }
  });
  
  for (const cluster of oldClusters) {
    const lastArticleDate = new Date(
      Math.max(...cluster.articles.map(a => a.publishedAt.getTime()))
    );
    
    const daysSinceLastArticle = 
      (Date.now() - lastArticleDate.getTime()) / (24 * 3600000);
    
    if (daysSinceLastArticle > 3) {
      // Archive cluster (mark as inactive)
      await prisma.cluster.update({
        where: { id: cluster.id },
        data: { 
          archived: true,
          archivedAt: new Date()
        }
      });
    }
  }
}
```

### Why This Approach Works

1. **News cycle alignment**: Stories naturally cluster within 24-48 hour windows
2. **Automatic clustering**: No manual intervention needed
3. **Scalable**: Fast keyword comparison within small time windows
4. **Self-cleaning**: Old clusters archive automatically
5. **Explainable**: Can show why articles are grouped
6. **Low cost**: No external APIs required

### Pros
- ✅ **Balanced accuracy/cost** - 70-80% accuracy at near-zero cost
- ✅ **Fast** - processes articles in milliseconds
- ✅ **Handles news cycle** - respects temporal patterns
- ✅ **Self-maintaining** - auto-archives old clusters
- ✅ **Scalable** - works with high article volumes
- ✅ **Explainable** - can show matched keywords and timeframe
- ✅ **No external dependencies** - uses existing infrastructure

### Cons
- ❌ **Still has keyword limitations** - synonyms, paraphrasing
- ❌ **Tuning required** - needs experimentation with time windows
- ❌ **May miss slow-burn stories** - stories developing over weeks
- ❌ **Time zone sensitivity** - may need normalization

### When to Use
- **MVP implementation** - good starting point
- Limited budget
- High article volume
- Want quick wins before investing in AI
- Need explainable clustering

### Estimated Accuracy
**70-80%** - Better than pure keywords due to temporal context, approaching NER-based methods.

**References:**
- Allan, J. (2002). "Topic Detection and Tracking: Event-based Information Organization." *Kluwer Academic Publishers*
- Swan, R., & Allan, J. (2000). "Automatic generation of overview timelines." *SIGIR*
- Yang, Y., et al. (1998). "A comparative study on feature selection in text categorization." *ICML*

---

## Comparison Matrix

| Approach | Accuracy | Cost/Month | Speed | Complexity | Maintenance | Scalability |
|----------|----------|------------|-------|------------|-------------|-------------|
| **Keyword-based** | 60-70% | $0 | Very Fast | Low | Medium | Excellent |
| **LLM-based** | 85-92% | $10-50 | Slow | Low | Low | Good |
| **Embedding-based** | 88-94% | $1-5 | Fast* | Medium | Low | Excellent |
| **NER-based** | 75-85% | $0-30 | Medium | Medium | Medium | Good |
| **Temporal+Keyword** | 70-80% | $0 | Very Fast | Low | Low | Excellent |

\* Fast after initial embedding; embedding itself is medium speed

---

## Recommended Implementation Roadmap

### Phase 1: MVP (Weeks 1-2)

**Approach:** Temporal + Keyword Hybrid

**Implementation steps:**
1. Add temporal windowing to clustering (24-48 hour windows)
2. Implement weighted keyword similarity with decay
3. Add cluster lifecycle management (auto-archive after 3 days inactive)
4. Create API endpoint: `GET /api/clusters` to retrieve active clusters
5. Build UI to display clustered articles

**Expected results:**
- 70-80% clustering accuracy
- Real-time clustering as articles arrive
- Zero ongoing costs
- Processing: <50ms per article

**Validation:**
- Manual review of 100 clustered articles
- Measure precision/recall
- User feedback on clustering quality

### Phase 2: Enhanced Accuracy (Weeks 3-4)

**Approach:** Add NER to existing system

**Implementation steps:**
1. Integrate compromise.js for entity extraction
2. Extract PERSON, ORG, GPE entities from titles/descriptions
3. Enhance clustering to consider entity matches (weighted higher than keywords)
4. Display matched entities in cluster UI

**Expected improvement:**
- Accuracy increases to 80-85%
- Better handling of proper nouns
- More precise cluster definitions

### Phase 3: Semantic Understanding (Weeks 5-8)

**Approach:** Add embedding-based similarity

**Implementation steps:**
1. Set up pgvector extension in PostgreSQL
2. Generate embeddings for all articles using text-embedding-3-small
3. Implement hybrid scoring: 50% temporal+keyword, 50% embedding similarity
4. Add "similar articles" recommendation feature
5. Enable semantic search

**Expected improvement:**
- Accuracy increases to 88-92%
- Handles synonyms and paraphrasing
- Enables new features (recommendations, semantic search)

**Cost:** ~$1-5/month for embeddings

### Phase 4: LLM Enhancements (Optional, Weeks 9-12)

**Approach:** LLM-generated summaries and verification

**Implementation steps:**
1. Generate summary for each cluster using GPT-4o-mini
2. Use LLM to verify questionable clusters (low confidence)
3. Extract structured information (who, what, when, where, why)
4. Generate multi-perspective analysis

**Expected improvement:**
- Better user experience with summaries
- Catches edge cases and improves accuracy to 90-95%
- Richer cluster metadata

**Cost:** ~$10-30/month for summaries

---

## Implementation Example: Complete Flow

```typescript
// clustering-service.ts

import { prisma } from '@/lib/db';
import type { Article, Cluster } from '@prisma/client';

interface ClusteringConfig {
  timeWindowHours: number;
  minSharedKeywords: number;
  similarityThreshold: number;
  decayFactor: number;
}

const defaultConfig: ClusteringConfig = {
  timeWindowHours: 48,
  minSharedKeywords: 3,
  similarityThreshold: 0.65,
  decayFactor: 0.02
};

export class ClusteringService {
  constructor(private config: ClusteringConfig = defaultConfig) {}

  /**
   * Main entry point: cluster a new article
   */
  async clusterArticle(article: Article): Promise<void> {
    // Find matching cluster
    const cluster = await this.findMatchingCluster(article);
    
    if (cluster) {
      // Add to existing cluster
      await prisma.article.update({
        where: { id: article.id },
        data: { clusterId: cluster.id }
      });
      
      console.log(`Added article ${article.id} to cluster ${cluster.id}`);
    } else {
      // Create new cluster
      const newCluster = await this.createCluster(article);
      
      await prisma.article.update({
        where: { id: article.id },
        data: { clusterId: newCluster.id }
      });
      
      console.log(`Created new cluster ${newCluster.id} for article ${article.id}`);
    }
  }

  /**
   * Find best matching cluster for an article
   */
  private async findMatchingCluster(
    article: Article
  ): Promise<Cluster | null> {
    const windowStart = new Date(
      article.publishedAt.getTime() - 
      this.config.timeWindowHours * 3600000
    );
    
    const candidates = await prisma.cluster.findMany({
      where: {
        firstSeenAt: { gte: windowStart },
        archived: false
      },
      include: {
        articles: {
          select: {
            keywords: true,
            publishedAt: true
          }
        }
      }
    });
    
    let bestMatch: { cluster: Cluster; score: number } | null = null;
    
    for (const cluster of candidates) {
      const score = this.calculateSimilarity(article, cluster);
      
      if (score >= this.config.similarityThreshold &&
          (!bestMatch || score > bestMatch.score)) {
        bestMatch = { cluster, score };
      }
    }
    
    return bestMatch?.cluster || null;
  }

  /**
   * Calculate similarity between article and cluster
   */
  private calculateSimilarity(
    article: Article,
    cluster: Cluster & { articles: Array<{ keywords: string[]; publishedAt: Date }> }
  ): number {
    const articleKeywords = new Set(article.keywords);
    const clusterKeywordScores = new Map<string, number>();
    
    // Aggregate cluster keywords with temporal decay
    const now = article.publishedAt.getTime();
    
    cluster.articles.forEach(a => {
      const ageHours = (now - a.publishedAt.getTime()) / 3600000;
      const decay = Math.exp(-ageHours * this.config.decayFactor);
      
      a.keywords.forEach(keyword => {
        const current = clusterKeywordScores.get(keyword) || 0;
        clusterKeywordScores.set(keyword, current + decay);
      });
    });
    
    // Calculate weighted Jaccard similarity
    let intersection = 0;
    articleKeywords.forEach(keyword => {
      if (clusterKeywordScores.has(keyword)) {
        intersection += Math.min(1, clusterKeywordScores.get(keyword)!);
      }
    });
    
    const union = articleKeywords.size + 
                  clusterKeywordScores.size - 
                  intersection;
    
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Create a new cluster for an article
   */
  private async createCluster(article: Article): Promise<Cluster> {
    const topic = article.keywords.slice(0, 3).join(' ');
    const mainEntity = article.keywords[0] || 'Unknown';
    
    return prisma.cluster.create({
      data: {
        topic,
        mainEntity,
        firstSeenAt: article.publishedAt
      }
    });
  }

  /**
   * Archive old inactive clusters (run periodically)
   */
  async archiveInactiveClusters(daysInactive: number = 3): Promise<number> {
    const cutoffDate = new Date(
      Date.now() - daysInactive * 24 * 3600000
    );
    
    const clustersToArchive = await prisma.cluster.findMany({
      where: {
        archived: false,
        articles: {
          every: {
            publishedAt: { lt: cutoffDate }
          }
        }
      }
    });
    
    for (const cluster of clustersToArchive) {
      await prisma.cluster.update({
        where: { id: cluster.id },
        data: { 
          archived: true,
          // Note: Add archivedAt field to schema if needed
        }
      });
    }
    
    return clustersToArchive.length;
  }

  /**
   * Get active clusters with article counts
   */
  async getActiveClusters(limit: number = 50) {
    return prisma.cluster.findMany({
      where: {
        archived: false
      },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            sourceId: true,
            publishedAt: true
          },
          orderBy: {
            publishedAt: 'desc'
          }
        }
      },
      orderBy: {
        firstSeenAt: 'desc'
      },
      take: limit
    });
  }
}

// Usage example
export const clusteringService = new ClusteringService();
```

**API Route:**
```typescript
// app/api/clusters/route.ts

import { NextResponse } from 'next/server';
import { clusteringService } from '@/lib/clustering/clustering-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  
  const clusters = await clusteringService.getActiveClusters(limit);
  
  return NextResponse.json({
    success: true,
    count: clusters.length,
    clusters
  });
}
```

---

## Monitoring & Evaluation

### Key Metrics

1. **Clustering Precision**: What % of articles in a cluster actually belong together?
2. **Clustering Recall**: What % of related articles are successfully grouped?
3. **Cluster Size Distribution**: Are clusters too large or too small?
4. **Processing Time**: How long does it take to cluster each article?
5. **Cluster Lifespan**: How long do clusters stay active?

### Evaluation Approach

```typescript
interface ClusteringMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  avgClusterSize: number;
  avgProcessingTimeMs: number;
}

async function evaluateClustering(
  testArticles: Article[],
  groundTruth: Map<string, string[]>  // Manual cluster assignments
): Promise<ClusteringMetrics> {
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  
  // For each pair of articles
  for (let i = 0; i < testArticles.length; i++) {
    for (let j = i + 1; j < testArticles.length; j++) {
      const article1 = testArticles[i];
      const article2 = testArticles[j];
      
      const systemClustered = article1.clusterId === article2.clusterId;
      const shouldBeClustered = groundTruth.get(article1.id)?.includes(article2.id);
      
      if (systemClustered && shouldBeClustered) truePositives++;
      if (systemClustered && !shouldBeClustered) falsePositives++;
      if (!systemClustered && shouldBeClustered) falseNegatives++;
    }
  }
  
  const precision = truePositives / (truePositives + falsePositives);
  const recall = truePositives / (truePositives + falseNegatives);
  const f1Score = 2 * (precision * recall) / (precision + recall);
  
  return {
    precision,
    recall,
    f1Score,
    avgClusterSize: 0, // Calculate from data
    avgProcessingTimeMs: 0 // Measure during processing
  };
}
```

---

## Conclusion

**Recommended Implementation Path:**

1. **Start with Temporal + Keyword Hybrid** (Phase 1)
   - Zero cost, fast implementation
   - Provides 70-80% accuracy immediately
   - Establishes clustering infrastructure

2. **Add NER for entity-based clustering** (Phase 2)
   - Improves accuracy to 80-85%
   - Addresses original requirement for location/agency detection
   - Still zero or low cost with compromise.js

3. **Integrate embeddings for semantic understanding** (Phase 3)
   - Achieves 88-92% accuracy
   - Enables additional features (recommendations, semantic search)
   - Low ongoing cost (~$1-5/month)

4. **Optionally add LLM for summaries and edge cases** (Phase 4)
   - Enhances user experience with cluster summaries
   - Catches difficult clustering decisions
   - Moderate cost (~$10-30/month)

This approach balances immediate value delivery with long-term accuracy goals while keeping costs minimal in early stages.

**Next Steps:**
1. Review this research with team
2. Decide on Phase 1 implementation timeline
3. Set up clustering evaluation framework
4. Implement temporal + keyword hybrid clustering
5. Collect metrics and iterate

---

## References & Resources

### Academic Papers
1. Allan, J. (2002). "Topic Detection and Tracking: Event-based Information Organization." Kluwer Academic Publishers.
2. Reimers, N., & Gurevych, I. (2019). "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks." EMNLP.
3. Salton, G., & Buckley, C. (1988). "Term-weighting approaches in automatic text retrieval." Information Processing & Management.
4. Li, J., et al. (2020). "A Survey on Deep Learning for Named Entity Recognition." IEEE TKDE.
5. Brown, T., et al. (2020). "Language Models are Few-Shot Learners." NeurIPS.

### Tools & Libraries
- **rss-parser**: Already integrated for RSS feed parsing
- **compromise**: Lightweight NER for JavaScript - https://github.com/spencermountain/compromise
- **wink-nlp**: Alternative NER library - https://winkjs.org/wink-nlp/
- **pgvector**: PostgreSQL vector extension - https://github.com/pgvector/pgvector
- **density-clustering**: DBSCAN implementation - https://www.npmjs.com/package/density-clustering
- **OpenAI API**: For embeddings and LLM - https://platform.openai.com/docs

### Cost References
- OpenAI Pricing: https://openai.com/api/pricing/
- Google Cloud NLP: https://cloud.google.com/natural-language/pricing
- AWS Comprehend: https://aws.amazon.com/comprehend/pricing/

### Datasets for Evaluation
- TREC-2004 Novelty Track: Benchmark for clustering/deduplication
- Google News Dataset: For testing news clustering
- Your own labeled data: Sample 100-200 articles and manually cluster them

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Author:** Research Analysis  
**Status:** Ready for Review