# Polish Notation

Evaluate an arithmetic expression written in postfix notation, also called reverse Polish notation. Each token is either an integer or one of the operators `+`, `-`, `*`, and `/`.

Division truncates toward zero. The expression is always valid, and intermediate and final values fit in a signed 32-bit integer.

## Input

- `tokens`: the postfix expression.

## Output

The integer value of the expression.

## Examples

**Example 1**

```
Input: tokens = ["2","1","+","3","*"]
Output: 9
```

`(2 + 1) * 3 = 9`.

**Example 2**

```
Input: tokens = ["4","13","5","/","+"]
Output: 6
```

`13 / 5` truncates to `2`, then `4 + 2 = 6`.

**Example 3**

```
Input: tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]
Output: 22
```

## Constraints

- `1 <= tokens.length <= 10,000`
- Each numeric token is an integer in `[-200, 200]`.
- Operators are only `+`, `-`, `*`, and `/`.
- No division by zero occurs.

## Follow-up

How would you evaluate prefix notation instead?
