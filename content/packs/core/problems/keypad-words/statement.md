# Keypad Words

An old phone keypad maps digits to letters:

| Digit | Letters |
| ----- | ------- |
| 2     | abc     |
| 3     | def     |
| 4     | ghi     |
| 5     | jkl     |
| 6     | mno     |
| 7     | pqrs    |
| 8     | tuv     |
| 9     | wxyz    |

Given a string of digits, return every word that can be formed by choosing one letter for each digit in order. Return the words in any order.

## Input

- `digits`: a non-empty string containing only digits from `2` through `9`.

## Output

All possible letter strings, with one letter chosen for each digit. The order of the returned strings does not matter.

## Examples

**Example 1**

```
Input: digits = "23"
Output: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]
```

**Example 2**

```
Input: digits = "2"
Output: ["a", "b", "c"]
```

**Example 3**

```
Input: digits = "79"
Output: 16 words from "pw" through "sz"
```

Digit `7` has four letters and digit `9` has four letters.

**Example 4**

```
Input: digits = "22"
Output: ["aa", "ab", "ac", "ba", "bb", "bc", "ca", "cb", "cc"]
```

Repeating a digit repeats its letter set.

## Constraints

- `1 <= digits.length <= 4`
- `digits` contains only `2`, `3`, `4`, `5`, `6`, `7`, `8`, and `9`.

## Follow-up

How would you count the number of words for a much longer digit string without building any of them?
