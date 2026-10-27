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
Input: letters = "abccccdd"
Output: 7
```

One longest palindrome is `"dccaccd"`.

**Example 2**

```
Input: letters = "a"
Output: 1
```

**Example 3**

```
Input: letters = "aa"
Output: 2
```

## Constraints

- `0 <= letters.length <= 200,000`
- `letters` contains only lowercase English letters.

## Follow-up

Can you compute the result with a single pass over the frequency table?
