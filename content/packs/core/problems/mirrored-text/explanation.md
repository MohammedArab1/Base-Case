# Explanation

## Key insight

Only letters and digits matter, and case is irrelevant. Two pointers can skip everything else and compare the meaningful characters from the outside in.

## Algorithm

1. Set `left` to the first index and `right` to the last.
2. While `left < right`, advance `left` over non-alphanumeric characters and retreat `right` similarly.
3. If both pointers still point at characters, compare their lowercase forms. A mismatch returns `false`.
4. Move both pointers inward and continue. If they meet, return `true`.

## Correctness

Each comparison pairs the first meaningful character with the last, then the second with the second-last, and so on. Skipping irrelevant characters does not change that order. If every pair matches, the normalized string is a palindrome. If a pair differs, no rearrangement can make the original sequence mirrored.

## Complexity

- Time: `O(n)`, because each pointer moves across the string at most once.
- Space: `O(1)`.

## Common mistakes

- Comparing punctuation or spaces.
- Forgetting to lowercase letters.
- Indexing outside the string after skipping characters.
- Returning `false` for an empty or all-punctuation string.
