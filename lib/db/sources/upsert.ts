import { extractDomain, getReliability, RSSSource } from "@/lib/news";
import { prisma } from '@/lib/db';


export async function upsertSources(rssSources: RSSSource[]): Promise<{ sourceMap: Map<string, string>, sourcesCreated: number, sourcesUpdated: number }> {
  console.log('💾 Upserting sources...');
  let sourceMap = new Map<string, string>();
  let sourcesCreated = 0;
  let sourcesUpdated = 0;

  for (const rssSource of rssSources) {
    const domain = extractDomain(rssSource.url);

    try {
      const existingSource = await prisma.source.findUnique({
        where: { domain }
      });

      const source = await prisma.source.upsert({
        where: { domain },
        update: {
          name: rssSource.name,
          rssUrl: rssSource.url,
          biasRating: rssSource.biasRating,
          reliability: getReliability(rssSource.biasRating),
        },
        create: {
          name: rssSource.name,
          domain,
          rssUrl: rssSource.url,
          biasRating: rssSource.biasRating,
          reliability: getReliability(rssSource.biasRating),
        },
      });

      sourceMap.set(rssSource.name, source.id);

      if (existingSource) {
        sourcesUpdated++;
      } else {
        sourcesCreated++;
      }
    } catch (error) {
      console.error(`❌ Error upserting source ${rssSource.name}:`, error);
    }
  }

  console.log(`✅ Created ${sourcesCreated} sources, updated ${sourcesUpdated} sources`);

  return { sourceMap, sourcesCreated, sourcesUpdated };
}
