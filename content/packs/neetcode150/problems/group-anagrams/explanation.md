# Explanation

## Key insight

Two words are anagrams exactly when they have the same multiset of letters. If we turn that multiset into a canonical signature, all anagrams share one signature and no non-anagrams do.

A simple signature is the word with its letters sorted. For example, `"listen"`, `"silent"`, and `"enlist"` all become `"eilnst"`. A 26-slot frequency table is another valid signature and avoids the per-word sort.

## Algorithm

1. Create a map from signature to a list of words.
2. For each word, compute its signature and append the word to the matching list.
3. Sort every group internally in lexicographic order.
4. Sort the groups by their first word.
5. Return the groups.

## Correctness

If two words are anagrams, they contain the same letters with the same multiplicities, so they produce the same signature and land in the same group. If two words land in the same group, their signatures are equal, which means their letter multisets are equal, so they are anagrams. Sorting inside each group and sorting the groups by their smallest word then produces exactly the required canonical representation.

## Complexity

Let `N` be the number of words, `L` the maximum word length, and `T` the total number of characters.

- Building the signatures takes `O(T)` time with frequency tables.
- Sorting output groups takes `O(N log N)` comparisons; each comparison can inspect up to `L` characters, so the worst-case bound is `O(T + N log N * L)`.
- Space is `O(T)` for the stored words, signatures, and output. The input is not copied beyond the groups.

The alternative sorted-letter signature costs `O(L log L)` per word but is usually simpler to write.

## Common mistakes

- Using a set of distinct letters as the signature. This collapses `"aab"` and `"ab"` even though they are not anagrams.
- Forgetting to sort inside each group, which makes the answer depend on insertion order.
- Using a set for the groups and accidentally deleting duplicate words.
- Returning an empty list for `[""]`; the empty word is a valid one-element group.
