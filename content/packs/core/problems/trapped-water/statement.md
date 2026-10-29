# Trapped Water

A row of vertical bars has the heights in `heights`. After rain, water collects in the gaps between bars. Assume water cannot escape past the ends of the row.

Return the total number of water units trapped.

## Input

- `heights`: non-negative bar heights.

## Output

The total trapped water.

## Examples

**Example 1**

```
Input: heights = [3,0,2,0,4]
Output: 7
```

Water collects above the two zeros and the bar of height `2`.

**Example 2**

```
Input: heights = [2,0,0,1]
Output: 2
```

The two empty cells between the bars each hold one unit.

**Example 3**

```
Input: heights = [1,3,0,2,4]
Output: 4
```

**Example 4**

```
Input: heights = [5,4,3,2]
Output: 0
```

The bars only descend, so no water is trapped.

**Example 5**

```
Input: heights = []
Output: 0
```

## Constraints

- `0 <= heights.length <= 100,000`
- `0 <= heights[i] <= 1,000,000`

## Follow-up

Can you compute the answer with two pointers and no extra arrays?
