# Letter Tally

Two lowercase words are **tally matches** when one can be rearranged into the other. In other words, they contain exactly the same letters with the same frequencies.

Return whether `first` and `second` are tally matches.

## Input

- `first`: a lowercase string.
- `second`: a lowercase string.

## Output

`true` if the letter counts are identical, otherwise `false`.

## Examples

**Example 1**

```
Input: first = "garden", second = "danger"
Output: true
```

Both words contain one `g`, one `a`, one `r`, one `d`, one `e`, and one `n`.

**Example 2**

```
Input: first = "stone", second = "notes"
Output: true
```

**Example 3**

```
Input: first = "apple", second = "paper"
Output: false
```

The letter counts differ.

**Example 4**

```
Input: first = "", second = ""
Output: true
```

**Example 5**

```
Input: first = "a", second = "a"
Output: true
```

## Constraints

- `0 <= first.length, second.length <= 200,000`
- Both strings contain only lowercase English letters.

## Follow-up

Can you do it with a single frequency table instead of two?
