# Explanation

## Key insight

A palindrome is determined by its center. Expanding outward from every possible center examines all palindromic substrings without checking unrelated pairs.

## Algorithm

1. For each character, expand around it for odd-length palindromes.
2. For each gap, expand around the gap for even-length palindromes.
3. Keep the longest range found, updating only on a strictly longer palindrome so the earliest start wins ties.
4. Return the recorded slice.

## Correctness

Every palindrome has a unique center, either a character or a gap. The expansion from that center stops exactly when symmetry breaks, so it finds the maximal palindrome for that center. Taking the maximum over all centers therefore finds the global longest palindrome, and the tie rule selects the earliest start.

## Complexity

- Time: `O(n^2)` in the worst case.
- Space: `O(1)` aside from the output.

## Common mistakes

- Checking only odd-length centers.
- Updating the answer on equal length and losing the earliest start.
- Expanding past the string boundaries.

## Related pattern

Manacher's algorithm reuses expansion information to reach linear time.
