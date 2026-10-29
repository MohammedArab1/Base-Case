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
Input: expression = "7 + 2"
Output: 9
```

**Example 2**

```
Input: expression = " 10-4 + 3 "
Output: 9
```

**Example 3**

```
Input: expression = "(2+(3+4)-1)+(5+6)"
Output: 19
```

**Example 4**

```
Input: expression = "-5+2"
Output: -3
```

The leading minus is a unary sign.

**Example 5**

```
Input: expression = "4-(2-6)"
Output: 8
```

The inner group evaluates to `-4`, so the result is `4 - (-4)`.

## Constraints

- `1 <= expression.length <= 100,000`
- The expression contains digits, spaces, `+`, `-`, `(`, and `)`.
- There are no two consecutive operators. A `-` is unary only at the start of the expression or after a `(` (spaces are allowed).
- Parentheses are balanced and the expression is valid.
- Intermediate results fit in a signed 32-bit integer.

## Follow-up

How would you extend the evaluator to support multiplication and division?
