# Explanation

## Key insight

Each key needs its own timeline. Because writes arrive in globally increasing time, appending to a per-key list keeps that list sorted. A query is then a predecessor search: the rightmost timestamp at or before the query time.

## Algorithm

1. Create a map from key to a list of `(timestamp, value)` pairs.
2. For `"set"`, append the pair to the key's list.
3. For `"get"`, look up the key's list. If it is absent or empty, append `""`.
4. Otherwise binary search for the first timestamp greater than the query time. The entry immediately before it is the latest write at or before the query time. If that position is at the beginning, append `""`.
5. Return the accumulated answers.

## Correctness

For a key, the stored list is sorted because writes are appended in strictly increasing timestamp order. Binary search finds the boundary between timestamps at most the query time and timestamps greater than it. The element immediately before the boundary is therefore the latest write that the query is allowed to see. If the boundary is at index zero, no write is early enough. The algorithm returns exactly the required value for every read.

## Complexity

Let `w` be the number of writes and `q` the number of reads. Each write costs `O(1)` amortized and each read costs `O(log w)`, so the total time is `O(w + q log w)`, bounded by `O((w + q) log w)`. The space is `O(w)` for the histories.

## Common mistakes

- Returning the most recent write overall instead of the most recent write for the queried key.
- Using `<` instead of `<=` when comparing a write timestamp with the query time.
- Forgetting that a query before the first write for a key returns `""`.
- Adding writes to one shared timeline without tracking keys.
- Assuming query timestamps are increasing; they are not required to be.
