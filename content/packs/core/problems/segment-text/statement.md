# Segment Text

Given a text and a list of dictionary words, decide whether the text can be split into a sequence of dictionary words. Each word may be reused any number of times.

An empty text is segmented by zero words, so it is always segmentable.

## Input

- `text`: the string to segment.
- `words`: distinct non-empty dictionary words.

## Output

`true` if a complete segmentation exists, otherwise `false`.

## Examples

**Example 1**

```
Input: text = "sunrise", words = ["sun","rise"]
Output: true
```

**Example 2**

```
Input: text = "sunriserise", words = ["sun","rise"]
Output: true
```

The word `"rise"` is reused.

**Example 3**

```
Input: text = "grapes", words = ["grape","grapes","pe"]
Output: true
```

**Example 4**

```
Input: text = "grapes", words = ["grape","grap"]
Output: false
```

Neither dictionary word helps segment the final `"es"`.

**Example 5**

```
Input: text = "", words = []
Output: true
```

## Constraints

- `0 <= text.length <= 1,000`
- `0 <= words.length <= 1,000`
- `1 <= words[i].length <= 20`
- Dictionary words are distinct.

## Follow-up

How can a trie reduce the work of checking every possible word boundary?
