# Explanation

## Key insight

The minimum of a stack can be stored alongside each element. When a new value is pushed, the new minimum is the smaller of that value and the minimum that was already on top. When the value is popped, the previous minimum becomes available again automatically. This avoids scanning the stack on every query.

## Algorithm

1. Create an empty stack of `(value, minimum_at_this_depth)` pairs and an empty result list.
2. For each operation:
   - `push v`: let `current_min = v` if the stack is empty, otherwise `min(v, stack[-1].minimum)`. Push `(v, current_min)`.
   - `pop`: remove the top pair and append `-1` to the result.
   - `top`: append the top pair's value.
   - `getMin`: append the top pair's minimum.
3. Return the result list.

## Correctness

The invariant is that the second component of the top pair equals the minimum of all values currently in the stack. It holds after a push by construction. A pop removes the most recent value; the pair below still stores the minimum of the remaining values, so the invariant is restored. Therefore `getMin` returns the true minimum, and `top` returns the true top value. The simulation processes operations in order, so its output matches the requested operation log.

## Complexity

For a sequence of `m` operations:

- Each operation does a constant amount of work.
- Time: `O(m)`.
- Space: `O(p)`, where `p` is the maximum number of simultaneously pushed values.

## Common mistakes

- Scanning all stack elements inside `getMin`, which makes that operation linear.
- Storing only one global minimum. Popping the minimum would then leave an incorrect value.
- Collapsing duplicate minima into one marker. If the same minimum is pushed twice, it must be popped twice before the previous minimum returns.
- Emitting a value for `push`, or forgetting that every `pop` contributes `-1`.
- Using a separate minimum stack but failing to keep the two stacks synchronized.
