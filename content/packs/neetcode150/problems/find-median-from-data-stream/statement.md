# Streaming Median Tracker

Design a tracker that accepts numbers one at a time and can report the median of all numbers seen so far. The median is the middle value when the collection is sorted. When the collection has an even size, the median is the average of the two middle values.

You are given a command sequence through two parallel arrays. `"addNum"` uses `values[i]` to insert a number. `"findMedian"` reports the current median and ignores its entry in `values` (the sentinel value `0` is supplied). Return one median for every `"findMedian"` command, in order.

## Input

- `operations`: a list containing `"addNum"` and `"findMedian"`.
- `values`: one integer per command; the value is ignored for `"findMedian"`.

## Output

A list of medians as floating-point numbers, one per `"findMedian"` command.

## Examples

**Example 1**

```
Input: operations = ["addNum", "addNum", "findMedian", "addNum", "findMedian"],
       values = [5, 1, 0, 9, 0]
Output: [3.0, 5.0]
```

After `5` and `1`, the two middle values are `1` and `5`, giving `3.0`. Adding `9` makes `5` the middle value.

**Example 2**

```
Input: operations = ["addNum", "findMedian"],
       values = [5, 0]
Output: [5.0]
```

**Example 3**

```
Input: operations = ["addNum", "addNum", "addNum", "findMedian"],
       values = [3, 1, 2, 0]
Output: [2.0]
```

## Constraints

- `1 <= operations.length == values.length <= 1000`
- Every operation is `"addNum"` or `"findMedian"`.
- `-100,000 <= values[i] <= 100,000`
- A `"findMedian"` command appears only after at least one number has been added.
- The value supplied with `"findMedian"` is always `0`.

## Notes

Answers within `1e-5` of the expected median are accepted.
