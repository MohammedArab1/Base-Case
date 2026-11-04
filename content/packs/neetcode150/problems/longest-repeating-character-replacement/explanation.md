# Explanation

## Key insight

For any chosen substring, the cheapest way to make it uniform is to keep its most frequent letter and replace every other character. If the window has length `L` and its maximum letter frequency is `M`, the number of replacements needed is `L - M`. The window is feasible exactly when `L - M <= k`.

## Algorithm

1. Maintain a window `[left, right]` and an array of 26 letter counts.
2. Move `right` forward one character at a time and add it to the counts.
3. Compute the maximum count in the window.
4. While `(right - left + 1) - maximum > k`, remove `s[left]` from the counts and move `left` forward.
5. Update the best length.
6. Return the best length.

## Correctness

For every right endpoint, the algorithm finds the longest feasible window ending there. When the window is too expensive, the left pointer advances until the replacement cost is within `k`; any longer window ending at the same right endpoint would contain the expensive window as a suffix and also be infeasible. The cost formula is exact because keeping the most frequent character minimizes the number of characters that must change, and no other choice can require fewer replacements. Taking the maximum over all right endpoints therefore gives the global optimum.

## Complexity

Let `n` be the length of `s`.

- The right pointer advances `n` times.
- The left pointer advances at most `n` times in total.
- Finding the maximum of 26 counters after each step costs `O(26)`.
- Time: `O(26n)`, which is `O(n)` because 26 is a constant.
- Space: `O(1)` for the fixed-size count array.

A common optimization tracks the maximum frequency seen so far instead of rescanning, which removes the factor of 26. The version above is easier to reason about because the maximum always describes the current window.

## Common mistakes

- Comparing every character to the first character of the window instead of finding the most frequent character.
- Shrinking with a single `if` rather than a `while`; one new character can require several removals.
- Forgetting that `k` may be larger than the number of characters that need changing, in which case the entire string works.
- Assuming the answer is always the whole string. For example, `"xyzxyz"` with `k = 3` can only reach length five.
- Recomputing the frequency table from scratch for every window instead of updating it incrementally.
