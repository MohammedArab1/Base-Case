# Warmer Days

A weather station records one temperature per day. For each day, find how many days you must wait until a day with a **strictly warmer** temperature.

If no warmer day comes later, put `0` for that day.

## Input

- `temperatures`: the daily temperatures in chronological order.

## Output

An array of the same length where index `i` contains the number of days until the next temperature greater than `temperatures[i]`, or `0` if there is none.

## Examples

**Example 1**

```
Input: temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
Output: [1, 1, 4, 2, 1, 1, 0, 0]
```

Day 2 reaches 76 four days later, while day 6 never sees a warmer day.

**Example 2**

```
Input: temperatures = [30, 40, 50, 60]
Output: [1, 1, 1, 0]
```

Every day warms up immediately until the last day.

**Example 3**

```
Input: temperatures = [90, 80, 70]
Output: [0, 0, 0]
```

The temperature only falls.

**Example 4**

```
Input: temperatures = [50, 50, 51]
Output: [2, 1, 0]
```

An equal temperature does not count, so day 0 waits for the `51`.

## Constraints

- `1 <= temperatures.length <= 100,000`
- `-100 <= temperatures[i] <= 100`

## Follow-up

Can you solve it in `O(n)` time without scanning forward from every day?
