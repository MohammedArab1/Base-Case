# Expression Calc

Evaluate an arithmetic expression containing non-negative integers, `+`, `-`, parentheses, and spaces. A `-` may act as a unary sign, such as in `"-2 + 1"`.

The expression is valid, and every intermediate and final value fits in a signed 32-bit integer.

## Input

- `expression`: the expression to evaluate.

## Output

The integer value.

## Examples

**Example 1**

```
Input: expression = "1 + 1"
Output: 2
```

**Example 2**

```
Input: expression = " 2-1 + 2 "
Output: 3
```

**Example 3**

```
Input: expression = "(1+(4+5+2)-3)+(6+8)"
Output: 23
```

**Example 4**

```
Input: expression = "-2+1"
Output: -1
```

## Constraints

- `1 <= expression.length <= 100,000`
- The expression contains digits, spaces, `+`, `-`, `(`, and `)`.
- There are no two consecutive operators. A `-` is unary only at the start of the expression or after a `(` (spaces are allowed).
- Parentheses are balanced and the expression is valid.
- Intermediate results fit in a signed 32-bit integer.

## Follow-up

How would you extend the evaluator to support multiplication and division?
