# Explanation

## Approach

Treat each airport as a vertex and each ticket as a directed edge. The task is to find the lexicographically smallest Eulerian trail that starts at `JFK` and uses every edge once.

Hierholzer's algorithm builds such a trail. For each airport, store its outgoing destinations in descending order so the smallest destination is at the end of the list. A recursive `visit` procedure repeatedly consumes the smallest available destination. When an airport has no outgoing tickets left, append it to the route and return. The final route is the postorder reversed.

Taking the smallest available edge first is what makes the resulting trail lexicographically smallest among all Eulerian trails from `JFK`.

## Correctness

Every call to `visit` consumes a distinct ticket, so the procedure uses each ticket at most once. Hierholzer's algorithm is guaranteed to consume every edge of a graph that has an Eulerian trail starting at the chosen vertex, and the postorder reversal is exactly such a trail.

For the tie-breaking claim, consider the first airport where an optimal trail and the greedy trail differ. The greedy trail took the smallest unused outgoing ticket at the previous airport. Any other trail that is still able to finish must either take that same ticket or one that is lexicographically larger; in the latter case its next airport is larger. A standard exchange argument extends this choice to a complete trail without making it smaller. Repeating at each decision point shows the produced trail is lexicographically smallest.

## Complexity

- Time: `O(E log E)` because the tickets are sorted; the Euler walk itself is `O(E)`.
- Space: `O(E)` for the adjacency lists and the recursion/route storage, where `E` is the number of tickets.

## Common mistakes

- Sorting destinations in ascending order and then popping from the end, which selects the largest destination first.
- Returning the postorder without reversing it.
- Refusing duplicate tickets or accidentally collapsing them into one edge.
- Greedily taking the smallest edge until stuck without backtracking, which can strand tickets that are still unused.
