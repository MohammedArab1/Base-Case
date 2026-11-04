# Explanation

## Approach

Keep the inserted numbers in a sorted list. Binary search finds the insertion position, and the list is updated there. For a median query, an odd-sized list returns the center element as a float. An even-sized list averages the two center elements.

The sorted-list approach is easy to reason about and comfortably handles the given limit of 1000 operations. A two-heap structure is the usual next step when insertions must be logarithmic.

## Correctness

The list remains sorted after every insertion because the new value is placed between all smaller values and all larger values. Therefore the center position contains the median for an odd count, and the average of the two center positions is the median for an even count. Every query reads the state after all preceding insertions, so the returned sequence matches the requested medians.

## Complexity

Let `n` be the number of values added so far.

- `addNum`: `O(n)` time because inserting into a Python list or splicing a TypeScript array shifts elements; finding the position is `O(log n)`.
- `findMedian`: `O(1)` time.
- Space: `O(n)` for the collection and `O(q)` for the output.

## Common mistakes

- Averaging the wrong pair when the size is even.
- Returning an integer division result for an even-sized collection.
- Sorting only when a median is requested, which is correct but slower.
- Forgetting that `"findMedian"` consumes a placeholder value in the parallel array.
