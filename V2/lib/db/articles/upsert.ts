import { extractKeywords, ParsedArticle } from "@/lib/news";
import { prisma } from '@/lib/db';

export async function upsertArticles(articles: ParsedArticle[], sourceMap: Map<string, string>): Promise<{ articlesCreated: number, articlesUpdated: number, articlesSkipped: number }> {
    console.log('📝 Upserting articles...');
    let articlesCreated = 0;
    let articlesUpdated = 0;
    let articlesSkipped = 0;

    for (const article of articles) {
        const sourceId = sourceMap.get(article.source.name);

        if (!sourceId) {
            console.log(`⚠️  Skipping article - source not found: ${article.source.name}`);
            articlesSkipped++;
            continue;
        }

        try {
            const existingArticle = await prisma.article.findUnique({
                where: { url: article.url }
            });

            await prisma.article.upsert({
                where: { url: article.url },
                update: {
                    title: article.title,
                    description: article.description,
                    imageUrl: article.imageUrl,
                    publishedAt: article.publishedAt,
                    keywords: extractKeywords(article.title, article.description),
                },
                create: {
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    imageUrl: article.imageUrl,
                    publishedAt: article.publishedAt,
                    sourceId,
                    keywords: extractKeywords(article.title, article.description),
                },
            });

            if (existingArticle) {
                articlesUpdated++;
            } else {
                articlesCreated++;
            }
        } catch (error) {
            console.error(`❌ Error creating/updating article "${article.title}":`, error);
            articlesSkipped++;
        }
    }

    console.log(`✅ Created ${articlesCreated} articles, updated ${articlesUpdated} articles`);
    if (articlesSkipped > 0) {
        console.log(`⚠️  Skipped ${articlesSkipped} articles`);
    }

    return { articlesCreated, articlesUpdated, articlesSkipped };
}
