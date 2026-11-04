# Flexible Brackets

A bracket string contains opening brackets `(`, closing brackets `)`, and jokers `*`. Each joker may independently stand for an opening bracket, a closing bracket, or nothing at all.

Decide whether some assignment of the jokers produces a balanced bracket sequence, meaning every closing bracket has a matching earlier opening bracket and the total number of opens equals the total number of closes.

## Input

- `text`: a non-empty string made only of `(`, `)`, and `*`.

## Output

Return `true` if at least one replacement of the jokers gives a balanced sequence; otherwise return `false`.

## Notes

- Jokers may be assigned independently and may be removed entirely.
- A joker assigned to an opening or closing bracket counts as that bracket.

## Examples

**Example 1**

```
Input: text = "(()*"
Output: true
```

**Example 2**

```
Input: text = "((*"
Output: false
```

**Example 3**

```
Input: text = "*"
Output: true
```

**Example 4**

```
Input: text = "((**)"
Output: true
```

## Constraints

- `1 <= text.length <= 2,000`
- `text` contains only `(`, `)`, and `*`.

## Follow-up

Can you decide the answer in one left-to-right pass using only two counters?
