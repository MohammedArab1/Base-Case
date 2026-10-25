# Explanation

## Key insight

Every time two sticks are joined, their combined length is charged as cost, and that combined stick may be charged again in a later join. Short sticks should therefore be joined early, so long sticks are charged as few times as possible. Always joining the two shortest sticks achieves this.

## Algorithm

1. Put all stick lengths into a min-heap.
2. While more than one stick remains:
   - Remove the two shortest sticks.
   - Add their sum to the total cost.
   - Push their sum back into the heap.
3. Return the total cost.

## Correctness

Consider an optimal sequence of joins. The first join combines two sticks. If they are not the two shortest, swap the longer chosen stick with a shorter unused stick. The swapped join is no more expensive, and the shorter stick now participates in the later merges instead of the longer one, so the total cannot increase. Repeatedly applying this exchange argument shows that some optimal solution begins by joining the two shortest sticks. After that join, the remaining problem is the same problem on the updated multiset. Induction therefore proves the greedy strategy optimal.

## Complexity

- Time: `O(n log n)`, because the heap performs `n - 1` removals and insertions.
- Space: `O(n)` for the heap.

## Common mistakes

- Joining in input order rather than by length.
- Forgetting to return the combined stick to the heap.
- Summing the final stick instead of the join costs.
- Using a sorted list and inserting with an `O(n)` shift, which becomes quadratic.
