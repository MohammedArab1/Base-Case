# Explanation

## Approach

Maintain a min-heap of the largest `k` values seen so far. Insert every initial value, trimming the smallest value whenever the heap exceeds size `k`. Repeat the same insert-and-trim step for each addition, then read the heap's minimum.

## Correctness

After each trim, the heap contains the `k` largest values of the collection. Any excluded value is no larger than the heap minimum, so it cannot enter the top `k` while those larger values remain. The smallest member of the top `k` is, by definition, the `k`-th largest value when duplicates are counted separately. Thus the value read after each addition is the required answer.

## Complexity

Let `n` be the initial size and `m` the number of additions.

- Time: `O((n + m) log k)`, because each insertion and removal costs `O(log k)`.
- Space: `O(k)` for the heap and `O(m)` for the output.

## Common mistakes

- Treating duplicates as one value.
- Keeping the smallest `k` values instead of the largest `k`.
- Using a max-heap and reading its maximum, which gives the largest value rather than the k-th largest.
- Forgetting to seed the heap with the initial values.
- Trimming before inserting, which can leave too few candidates.
