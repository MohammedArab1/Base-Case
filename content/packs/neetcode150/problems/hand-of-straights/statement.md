# Card Runs

A deck is represented by integer card values. You must use every card exactly once to form groups of exactly `groupSize` cards. Within a group, the card values, when sorted, must be consecutive integers with no gaps.

Determine whether the whole deck can be arranged this way.

## Input

- `hand`: the card values in the deck.
- `groupSize`: the exact number of cards required in every group.

## Output

Return `true` if all cards can be partitioned into consecutive runs of length `groupSize`; otherwise return `false`.

## Notes

- A run such as `7, 8, 9` is valid; `7, 8, 10` is not.
- Groups are determined only by card values, not by suits or colors.

## Examples

**Example 1**

```
Input: hand = [4, 5, 6, 7, 8, 9, 4, 5, 6], groupSize = 3
Output: true
```

**Example 2**

```
Input: hand = [1, 1, 2, 2, 2, 3, 3, 4, 4], groupSize = 3
Output: false
```

**Example 3**

```
Input: hand = [0, 0, 1, 1, 2, 2], groupSize = 2
Output: false
```

**Example 4**

```
Input: hand = [10, 11, 12], groupSize = 3
Output: true
```

## Constraints

- `1 <= hand.length <= 100,000`
- `1 <= groupSize <= hand.length`
- `0 <= hand[i] <= 1,000,000,000`

## Follow-up

How would the answer change if each group only needed distinct values rather than consecutive values?
