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
Input: digits = "26"
Output: ["am", "an", "ao", "bm", "bn", "bo", "cm", "cn", "co"]
```

**Example 2**

```
Input: digits = "47"
Output: ["gp", "gq", "gr", "gs", "hp", "hq", "hr", "hs", "ip", "iq", "ir", "is"]
```

Digit `4` has three letters and digit `7` has four.

**Example 3**

```
Input: digits = "58"
Output: ["jt", "ju", "jv", "kt", "ku", "kv", "lt", "lu", "lv"]
```

**Example 4**

```
Input: digits = "9"
Output: ["w", "x", "y", "z"]
```

**Example 5**

```
Input: digits = "33"
Output: ["dd", "de", "df", "ed", "ee", "ef", "fd", "fe", "ff"]
```

Repeating a digit repeats its letter set.

## Constraints

- `1 <= digits.length <= 4`
- `digits` contains only `2`, `3`, `4`, `5`, `6`, `7`, `8`, and `9`.

## Follow-up

How would you count the number of words for a much longer digit string without building any of them?
