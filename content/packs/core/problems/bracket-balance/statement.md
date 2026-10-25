# Bracket Balance

You are given a string made only of the characters `(`, `)`, `[`, `]`, `{`, and `}`. Return `true` when every opening bracket is closed by the matching type in the correct order.

An empty string is balanced.

## Input

- `text`: a string of bracket characters.

## Output

`true` when the brackets are balanced, otherwise `false`.

## Examples

**Example 1**

```
Input: text = "()"
Output: true
```

**Example 2**

```
Input: text = "([{}])"
Output: true
```

The inner pair closes before the outer pairs.

**Example 3**

```
Input: text = "(]"
Output: false
```

The closing bracket has the wrong type.

**Example 4**

```
Input: text = "([)]"
Output: false
```

Both pairs are complete, but they overlap instead of nesting.

**Example 5**

```
Input: text = ""
Output: true
```

There are no brackets to close.

## Constraints

- `0 <= text.length <= 100,000`
- `text` contains only `(`, `)`, `[`, `]`, `{`, and `}`.

## Follow-up

How would you report the index of the first bracket that breaks the balance?
