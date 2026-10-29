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
Input: temperatures = [64, 66, 63, 68, 61, 70]
Output: [1, 2, 1, 2, 1, 0]
```

Day 1 waits two days for `68`; day 3 waits two days for `70`.

**Example 2**

```
Input: temperatures = [55, 55, 56, 54]
Output: [2, 1, 0, 0]
```

Equal temperatures do not count, so day 0 waits for the `56`.

**Example 3**

```
Input: temperatures = [80, 79, 78]
Output: [0, 0, 0]
```

The temperature only falls.

**Example 4**

```
Input: temperatures = [41, 43, 42, 44]
Output: [1, 2, 1, 0]
```

**Example 5**

```
Input: temperatures = [70]
Output: [0]
```

## Constraints

- `1 <= temperatures.length <= 100,000`
- `-100 <= temperatures[i] <= 100`

## Follow-up

Can you solve it in `O(n)` time without scanning forward from every day?
