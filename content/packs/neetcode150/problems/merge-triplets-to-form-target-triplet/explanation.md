## Approach

A card that exceeds the target in any position can never be selected, because the componentwise maximum would then exceed the target and cannot be reduced. Discard those cards.

For the remaining usable cards, track the maximum value seen so far in each position. Selecting a card can only raise these maxima. At the end, the target is achievable exactly when all three maxima equal the corresponding target values.

## Correctness

Every selected card must be usable, so discarding cards above the target removes only impossible choices. For any collection of usable cards, the fused result is the componentwise maximum of that collection. The best possible result is therefore obtained by taking all usable cards, and its three positions are the tracked maxima. If each maximum equals the target, selecting all usable cards produces the target. If some maximum is below the target, no other usable card can raise that position, so the target is impossible. The target values are positive, so an empty selection cannot accidentally match.

## Complexity

- Time: `O(n)`, with one pass over the cards.
- Space: `O(1)`, since only three maxima are stored.

## Common mistakes

- Including a card whose rating exceeds the target in one position.
- Tracking only one component or combining the three positions incorrectly.
- Returning `true` when a target component was never reached.
- Forgetting that at least one card must be selected.

## Related pattern

Componentwise maxima also appear in problems about assembling a target profile from candidate profiles.
