## Approach

Scan the markers once from left to right. Keep `farthest`, the highest index reachable using the markers seen so far. When the scan reaches index `i`, first check whether `i` is reachable at all: if `i > farthest`, the scan has crossed a gap. Otherwise, the leap at `i` can extend the reachable frontier to `i + steps[i]`, so update `farthest`.

The scan can stop successfully as soon as `farthest` covers the final index.

## Correctness

Maintain the invariant that, after processing indices `0..i`, `farthest` is the largest index reachable from any processed marker. Initially only index `0` is reachable. If `i > farthest`, no processed marker can reach `i`, and every later index is even farther away, so the answer is `false`. If `i <= farthest`, then `i` is reachable, and every index up to `i + steps[i]` becomes reachable, which justifies the update. Thus the algorithm reports `false` exactly when the final index is unreachable and `true` when the frontier covers it.

## Complexity

- Time: `O(n)`, because each marker is visited at most once.
- Space: `O(1)`, aside from the input.

## Common mistakes

- Simulating every possible jump, which becomes exponential.
- Resetting the frontier after a zero jump instead of keeping the best reachable index.
- Checking whether the current index equals the last index before checking whether it is reachable.

## Related pattern

The same frontier scan answers reachability questions for intervals and for minimum-jump problems.
