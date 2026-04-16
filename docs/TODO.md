# TODO

> Auto-generated from code comments. Run `/collect-todos` to update.
> Check off items as they are resolved and remove the line when done.

## Uncategorized

- [ ] consider using query strings to fetch data -- can this not just be a server component? (`app/page.tsx:12`)
- [ ] consider if this is necessary?? (`app/page.tsx:136`)
- [ ] reconsider this function name -- getSourceCountUnique. Follow the invocations and ensuing constant names (`lib/utils/index.ts:16`)
- [ ] rename to isUUIDValid (`lib/utils/index.ts:21`)
- [ ] rename this midnightPrevious or midnightPrior (`lib/utils/index.ts:42`)
- [ ] consider if this is necessary - seems like dead code (`lib/news/rss-sources.ts:101`)
- [ ] look into - understand - this type and the check below (`lib/news/rss-parser.ts:60`)
- [ ] look into - understand - this function in more depth (`lib/news/rss-parser.ts:83`)
- [ ] convert this to a reduce function, returning allArticles and errors in destructured const (`lib/news/rss-parser.ts:185`)
- [ ] consider handler to prevent try/catch blocks. (`app/api/articles/route.ts:151`)
- [ ] update this so it's more like the post request (`app/api/articles/route.ts:175`)
- [ ] consider this field --> seems redundant with startedAt (`lib/db/rss-update-history/create.ts:19`)
