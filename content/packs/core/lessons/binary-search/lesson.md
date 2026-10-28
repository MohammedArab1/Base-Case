# Binary Search

Binary search is a guessing game. You have a range of possibilities, and each guess eliminates half of them.

```text
sorted: [1, 2, 4, 7, 9, 11, 15]
target: 9

low=0, high=7, mid=3 -> value 7 is too small -> low=4
low=4, high=7, mid=5 -> value 11 is too large -> high=5
low=4, high=5, mid=4 -> value 9 -> found
```

The array must be sorted, or at least have the property that one side can never contain the answer.

## Pick one range convention

Most bugs come from mixing conventions. Choose one and stay with it.

**Half-open** `[low, high)`:

```text
low = 0
high = n

while low < high:
    mid = low + (high - low) // 2
    if nums[mid] < target:
        low = mid + 1
    else:
        high = mid
```

This finds the first position whose value is at least the target. When the loop ends, `low` is that position. If no such position exists, `low == n`.

**Closed** `[low, high]`:

```text
while low <= high:
    mid = low + (high - low) // 2
    if nums[mid] == target:
        return mid
    if nums[mid] < target:
        low = mid + 1
    else:
        high = mid - 1
```

Both are correct. The half-open version is easier to adapt to lower-bound and upper-bound questions.

## Midpoint overflow

In JavaScript and Python, numbers are wide enough for ordinary array indices. In languages with 32-bit integers, `low + high` can overflow. Use:

```text
mid = low + (high - low) // 2
```

It computes the same midpoint without adding two large values.

## Rotated arrays

A rotated sorted array looks like two sorted runs:

```text
[7, 9, 11, 15, 1, 2, 4]
 └── sorted ──┘ └sorted┘
```

At the midpoint, at least one side is sorted.

```text
if nums[low] <= nums[mid]:
    left half is sorted
else:
    right half is sorted
```

If the target lies inside the sorted half's value range, search there. Otherwise search the other half. The range still halves each step, so the cost remains `O(log n)`.

## Searching for an answer, not an index

Sometimes the array is not the thing you search. The answer is.

**Cargo Deadline** asks for the smallest ship capacity that can carry all packages within a number of days. The capacity can range from the largest single package to the total weight. For any proposed capacity, you can simulate the days in `O(n)`.

```text
low  = largest package
high = total weight

while low < high:
    mid = low + (high - low) // 2
    if can_finish(mid):
        high = mid
    else:
        low = mid + 1
```

This is binary search on the **answer space**. The check must be monotonic: if capacity `c` works, every capacity larger than `c` must also work.

## The invariant sentence

Before coding, complete this:

> "Everything before `low` is ______, and everything from `high` onward is ______."

For a standard search, the blanks are "too small" and "too large." If you cannot fill them in, the loop condition is not ready yet.
