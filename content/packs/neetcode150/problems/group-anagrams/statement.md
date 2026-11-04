# Anagram Clusters

Given a list of words, group together the words that are anagrams of one another. Two words belong to the same group exactly when one can be rearranged into the other while using every letter the same number of times.

Return the groups in a deterministic form:

1. Sort the words inside each group in ascending lexicographic order.
2. Sort the groups by their first (smallest) word in ascending lexicographic order.

Duplicate words are separate entries and must be kept. The empty string is a valid word; empty strings form one group together.

## Input

- `words`: a list of lowercase words. The list may be empty, and a word may be empty.

## Output

A list of anagram groups in the required order.

## Examples

**Example 1**

```
Input: words = ["listen", "silent", "enlist", "tinsel", "google", "gooegl"]
Output: [["enlist", "listen", "silent", "tinsel"], ["gooegl", "google"]]
```

Both groups are sorted internally, and `"enlist"` comes before `"gooegl"`.

**Example 2**

```
Input: words = ["", "", "a"]
Output: [["", ""], ["a"]]
```

The two empty strings belong to one group.

**Example 3**

```
Input: words = ["abc", "bac", "cab", "acb"]
Output: [["abc", "acb", "bac", "cab"]]
```

All four words use the same three letters.

**Example 4**

```
Input: words = ["zzz", "z", "zz", "zzz"]
Output: [["z"], ["zz"], ["zzz", "zzz"]]
```

Repeated words stay in the output.

## Constraints

- `0 <= words.length <= 10,000`
- `0 <= words[i].length <= 100`
- Every word contains only lowercase English letters.
- The total number of characters across all words is at most `100,000`.

## Follow-up

Can you build the grouping key without sorting the letters of each word?
