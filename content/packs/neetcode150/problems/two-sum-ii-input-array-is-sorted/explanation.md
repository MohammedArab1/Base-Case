# Explanation

## Key insight

Because the list is sorted, the sum of the values at the two ends tells us which side to adjust. If the sum is too small, the left value is too small to pair with the current right value; moving the right pointer left would only make the sum smaller. If the sum is too large, the right value is too large; moving the left pointer right would only make the sum larger. Each comparison eliminates one candidate index.

## Algorithm

1. Set `left = 0` and `right = len(numbers) - 1`.
2. While `left < right`, compute `total = numbers[left] + numbers[right]`.
3. If `total == target`, return `[left, right]`.
4. If `total < target`, increment `left`.
5. Otherwise decrement `right`.
6. Return an empty list if no pair is found (the statement guarantees one exists, so this is defensive).

## Correctness

Consider the unique valid pair `(i, j)` with `i < j`. Suppose the algorithm is at `left <= i` and `right >= j`. If `numbers[left] + numbers[right] < target`, then since `numbers[right] >= numbers[j]`, we know `numbers[left] + numbers[j] <= numbers[left] + numbers[right] < target`. So index `left` cannot be part of any valid pair with an index at most `right`, and discarding it is safe. Symmetrically, if the sum is too large, index `right` cannot be part of any valid pair with an index at least `left`, so discarding it is safe. One of the two pointers eventually reaches `i` and `j`, at which point the sum matches.

## Complexity

- Time: `O(n)`, because each iteration moves exactly one pointer and the pointers never cross.
- Space: `O(1)` extra, aside from the two-element output list.

## Common mistakes

- Returning 1-based indices. The required indices are 0-based.
- Moving both pointers after a mismatch, which can skip the answer.
- Forgetting that duplicate values are allowed and that the two indices must still be distinct.
- Using `left <= right` and accidentally pairing an element with itself.
- Adding a hash map when the sorted order already gives a constant-space solution.
