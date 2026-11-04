# Digit Chain Addition

Two non-negative integers are stored as singly linked chains of decimal digits. The digits are stored least-significant first: the head holds the units digit, the next node the tens digit, and so on. Each node holds one digit from 0 to 9. A number has no leading zero unless the number itself is zero, which is stored as a single node `0`.

Add the two numbers and return the sum using the same least-significant-first chain format. You may reuse nodes or create new ones.

## Input

- `l1`, `l2`: heads of the two digit chains.

## Output

Return the head of the chain representing the sum.

## Examples

**Example 1**

```
Input: l1 = [2, 4, 3], l2 = [5, 6, 4]
Output: [7, 0, 8]
```

`342 + 465 = 807`.

**Example 2**

```
Input: l1 = [0], l2 = [0]
Output: [0]
```

**Example 3**

```
Input: l1 = [9, 9, 9], l2 = [1]
Output: [0, 0, 0, 1]
```

**Example 4**

```
Input: l1 = [5], l2 = [5]
Output: [0, 1]
```

## Constraints

- `1 <= number of nodes <= 1,000` for each chain
- Each node value is a decimal digit `0` through `9`.
- A number has no leading zero unless the number is zero.
- The sum fits in the returned chain with no extra leading zero.

## Follow-up

How would you add the numbers if the most-significant digit were stored first?
