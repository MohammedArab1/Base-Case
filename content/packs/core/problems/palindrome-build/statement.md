# Palindrome Build

Given a collection of lowercase letters, build the longest possible palindrome using some or all of them. Each letter may be used at most once.

Return the length of the longest palindrome.

## Input

- `letters`: a lowercase string representing the available letters.

## Output

The maximum palindrome length.

## Examples

**Example 1**

```
Input: letters = "aabbccd"
Output: 7
```

A longest palindrome is `"abcdcba"`.

**Example 2**

```
Input: letters = "zzxy"
Output: 3
```

The pair of `z`s surrounds either the `x` or the `y`.

**Example 3**

```
Input: letters = "qwerty"
Output: 1
```

Every letter appears once, so the palindrome has one character.

**Example 4**

```
Input: letters = ""
Output: 0
```

**Example 5**

```
Input: letters = "aaaaabbbbb"
Output: 9
```

Four pairs of `a`, four pairs of `b`, and one center letter.

## Constraints

- `0 <= letters.length <= 200,000`
- `letters` contains only lowercase English letters.

## Follow-up

Can you compute the result with a single pass over the frequency table?
