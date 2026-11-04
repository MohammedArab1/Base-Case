# Explanation

## Approach

Use depth-first backtracking over cut positions. At a position `start`, try every possible end position. If `s[start..end]` is a palindrome, add it to the current partition and recurse from `end + 1`. Reaching the end of the string records a complete partition.

Each candidate palindrome is checked by comparing characters from both ends toward the middle. The completed partitions are sorted lexicographically before they are returned.

## Correctness

Every recursive path cuts the string into contiguous nonempty pieces that exactly cover `s`. A piece is added only after the palindrome check succeeds, so every recorded partition consists entirely of palindromes. Conversely, any valid palindrome partition has a first piece that is a palindromic prefix; the recursion tries that piece and then finds the rest of the partition by induction. Thus all valid partitions are generated. Different cut positions produce different partitions, and sorting puts the result in the required canonical order.

## Complexity

Let `n` be the string length.

- Time: `O(n * 2^n)` in the worst case, including palindrome checks and output copying.
- Space: `O(n)` recursion and path space, plus the output.

## Common mistakes

- Allowing empty pieces.
- Checking only the first and last characters of a piece.
- Reusing characters from the suffix in the prefix.
- Forgetting to copy the path before adding it to the result.
- Returning partitions in recursion order without sorting them.
