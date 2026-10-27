# Segment Text

Given a text and a list of dictionary words, decide whether the text can be split into a sequence of dictionary words. Each word may be reused any number of times.

## Input

- `text`: the string to segment.
- `words`: distinct non-empty dictionary words.

## Output

`true` if a complete segmentation exists, otherwise `false`.

## Examples

**Example 1**

```
Input: text = "leetcode", words = ["leet","code"]
Output: true
```

**Example 2**

```
Input: text = "applepenapple", words = ["apple","pen"]
Output: true
```

The word `"apple"` is reused.

**Example 3**

```
Input: text = "catsandog", words = ["cats","dog","sand","and","cat"]
Output: false
```

## Constraints

- `0 <= text.length <= 1,000`
- `0 <= words.length <= 1,000`
- `1 <= words[i].length <= 20`
- Dictionary words are distinct.

## Follow-up

How can a trie reduce the work of checking every possible word boundary?
