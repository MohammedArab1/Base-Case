# Balanced Parenthesis Builder

Given `n` pairs of parentheses, generate every string that:

- contains exactly `n` opening parentheses and exactly `n` closing parentheses, and
- never has more closing parentheses than opening parentheses in any prefix.

Return the strings in ascending lexicographic order, where `'('` is smaller than `')'`.

For `n = 0` the only valid arrangement is the empty string, so return `[""]`.

## Input

- `n`: the number of parenthesis pairs.

## Output

All valid strings in ascending lexicographic order.

## Examples

**Example 1**

```
Input: n = 1
Output: ["()"]
```

**Example 2**

```
Input: n = 2
Output: ["(())", "()()"]
```

**Example 3**

```
Input: n = 3
Output: ["((()))", "(()())", "(())()", "()(())", "()()()"]
```

**Example 4**

```
Input: n = 4
Output: ["(((())))", "((()()))", "((())())", "((()))()", "(()(()))", "(()()())", "(()())()", "(())(())", "(())()()", "()((()))", "()(()())", "()(())()", "()()(())", "()()()()"]
```

## Constraints

- `0 <= n <= 8`

## Follow-up

Can the strings be produced in lexicographic order without sorting them afterward?
