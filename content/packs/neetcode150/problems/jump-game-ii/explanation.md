## Approach

Use a breadth-first scan without an explicit queue. Markers reachable with at most `k` jumps form one contiguous layer. `layerEnd` is the final index of the current layer, while `farthest` is the furthest index reachable by taking one more jump from any marker in the layer.

Walk through the markers. When the walk reaches `layerEnd`, every marker in the current layer has been considered, so one additional jump is necessary. Increment the jump count and move `layerEnd` to `farthest`, which becomes the end of the next layer.

## Correctness

Before crossing a layer boundary, `farthest` has been updated using every marker in the current layer, so it is exactly the furthest marker reachable with one more jump. Since jumps can land anywhere in a contiguous range, that furthest marker also determines the end of the next complete layer. Therefore each increment of `jumps` corresponds to an unavoidable new layer, and the number of layer expansions needed to cover the final marker is the minimum number of jumps. The loop deliberately stops before the final marker so that reaching it does not add an unnecessary jump.

## Complexity

- Time: `O(n)`, with one pass over the markers.
- Space: `O(1)`, aside from the input.

## Common mistakes

- Counting the final landing as an extra jump.
- Using only the largest single leap instead of the best leap from the whole current layer.
- Forgetting that a single-marker runway needs zero jumps.
- Updating the layer boundary before all markers in the current layer have been examined.

## Related pattern

Layer-by-layer greedy scanning also appears in minimum-refueling and interval-coverage problems.
