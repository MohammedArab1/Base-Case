# Explanation

## Key insight

The result is a decision tree: at each digit position, choose one of the digit's letters and continue with the next position. A depth-first traversal of that tree visits every combination exactly once.

## Algorithm

1. Build a map from each digit to its letters.
2. Recursively walk the digits with an index and a prefix.
3. If the index reaches the end of the digits, add the prefix to the result.
4. Otherwise, for each letter mapped to the current digit, append it and recurse with the next index.
5. Return the collected words.

## Correctness

Every word in the result has exactly one letter per digit, chosen in order, because the recursion consumes the digits left to right and appends one letter at each level. Conversely, any valid choice of one letter per digit describes exactly one root-to-leaf path in the decision tree, so every valid word is produced. Therefore the result contains all and only the valid words.

## Complexity

- Time: `O(n * 4^n)`, because there are at most `4^n` words and building each one copies up to `n` characters. Digits 7 and 9 have four letters, which gives the upper bound.
- Space: `O(n)` for the recursion stack and prefix, excluding the output.

## Common mistakes

- Returning the digits themselves instead of letters.
- Mismapping `7` or `9`, which each have four letters.
- Appending to a shared string and forgetting to remove the last character, which corrupts sibling branches.
- Forgetting that repeated digits are allowed.
