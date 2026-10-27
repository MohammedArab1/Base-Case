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
Input: heights = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
```

**Example 2**

```
Input: heights = [4,2,0,3,2,5]
Output: 9
```

**Example 3**

```
Input: heights = [1,2,3]
Output: 0
```

The bars only rise, so no water is trapped.

## Constraints

- `0 <= heights.length <= 100,000`
- `0 <= heights[i] <= 1,000,000`

## Follow-up

Can you compute the answer with two pointers and no extra arrays?
