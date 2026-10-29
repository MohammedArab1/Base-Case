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
Input: tokens = ["5","3","+","2","*"]
Output: 16
```

`(5 + 3) * 2 = 16`.

**Example 2**

```
Input: tokens = ["9","2","-","4","/"]
Output: 1
```

`9 - 2 = 7`, and `7 / 4` truncates to `1`.

**Example 3**

```
Input: tokens = ["6","2","/","3","+"]
Output: 6
```

`6 / 2 = 3`, then `3 + 3 = 6`.

**Example 4**

```
Input: tokens = ["-8","3","/"]
Output: -2
```

Division truncates toward zero, so `-8 / 3` becomes `-2`, not `-3`.

**Example 5**

```
Input: tokens = ["4","5","*","6","-"]
Output: 14
```

`4 * 5 = 20`, then `20 - 6 = 14`.

## Constraints

- `1 <= tokens.length <= 10,000`
- Each numeric token is an integer in `[-200, 200]`.
- Operators are only `+`, `-`, `*`, and `/`.
- No division by zero occurs.

## Follow-up

How would you evaluate prefix notation instead?
