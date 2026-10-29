# Longest Unique Stretch

Given a string `text`, return the length of the longest contiguous substring that contains no repeated character.

Characters are case-sensitive, so `'a'` and `'A'` are different. An empty string has length `0`.

## Input

- `text`: a string of printable ASCII characters.

## Output

The length of the longest substring with all distinct characters.

## Examples

**Example 1**

```
Input: text = "giraffe"
Output: 5
```

`"giraf"` is the longest stretch without a repeated character.

**Example 2**

```
Input: text = "cocoa"
Output: 3
```

`"coa"` starts at the third character.

**Example 3**

```
Input: text = "AaA"
Output: 2
```

Case matters, so `'A'` and `'a'` are different characters.

**Example 4**

```
Input: text = "ab12ab"
Output: 4
```

`"ab12"`, `"b12a"`, and `"12ab"` all have length four.

**Example 5**

```
Input: text = ""
Output: 0
```

## Constraints

- `0 <= text.length <= 100,000`
- `text` contains printable ASCII characters.

## Follow-up

How would you return the substring itself rather than its length?
