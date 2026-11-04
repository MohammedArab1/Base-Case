# Explanation

## Key insight

The values form a functional graph: from position `i`, the next position is `nums[i]`. Since every value is between 1 and `n`, all edges stay inside the array. A repeated value means two positions point to the same node, so the graph contains a cycle. The repeated value is the first node of that cycle.

## Algorithm

1. Start `slow` and `fast` at `nums[0]`.
2. Move `slow` one step and `fast` two steps until they meet. This meeting point is inside the cycle.
3. Reset `slow` to `nums[0]` and leave `fast` at the meeting point.
4. Move both one step at a time. The position where they meet again is the entrance to the cycle, which is the repeated value.
5. Return that value.

## Correctness

Following the mapping from index 0 must eventually repeat a node, so the reachable part of the graph contains a cycle. The entrance to that cycle has at least two incoming edges: one from the path that enters the cycle and one from its predecessor inside the cycle. Only the repeated value can have more than one incoming edge, so the cycle entrance is exactly the repeated label. Floyd's tortoise-and-hare algorithm finds a meeting point inside the cycle; the second phase then locates the entrance. The array is only read, never modified.

## Complexity

- Time: `O(n)`, because the pointers traverse the graph a constant number of times.
- Space: `O(1)` extra space.

## Common mistakes

- Sorting or marking the array, which violates the read-only requirement.
- Returning the meeting point instead of advancing to the cycle entrance.
- Confusing array positions with the values stored at those positions.
- Assuming the duplicate appears exactly twice; it may appear many times.
- Forgetting the `nums[0]` starting detail and looping forever.
