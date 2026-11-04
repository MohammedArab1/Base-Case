## Approach

Answer the queries offline in increasing coordinate order. Sort the intervals by start and sort the query indices by their query value.

As the query coordinate grows, add every interval whose start is at most the current query to a min-heap keyed by interval length. An interval whose end is before the current query cannot cover this or any later query. Remove such intervals whenever they reach the top of the heap. After the removal loop, the top entry is the shortest interval that still covers the current query.

## Correctness

The heap holds all intervals whose start is at most the current query, plus possibly some expired intervals buried below shorter valid ones. Expired intervals can never be the minimum while a shorter valid interval is present. If the minimum-length entry has expired, it is removed; this repeats until the top is either a covering interval or the heap is empty. Because the heap order is by length, the first valid top encountered is the shortest interval covering the query. Since queries are processed in increasing order, an interval that expires remains expired for every later query, so lazy removal is safe. Storing each answer at its original query index restores the required output order.

## Complexity

- Time: `O((n + q) log n)` for sorting and heap operations.
- Space: `O(n + q)` for the heap, sorted indices, and output.

## Common mistakes

- Sorting the answers instead of preserving the original query order.
- Forgetting that intervals are closed, so `end == query` still covers the query.
- Using interval width `end - start` instead of the inclusive length.
- Removing intervals whose start is too large before checking all eligible intervals.

## Related pattern

Offline sorting plus a heap is a common way to answer many range or coverage queries.
