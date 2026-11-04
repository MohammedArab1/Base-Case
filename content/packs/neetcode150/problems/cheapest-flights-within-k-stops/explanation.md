# Explanation

## Approach

This is a shortest-path problem with a limit on the number of edges. Run a layered Bellman-Ford: `dist[v]` is the cheapest known cost to reach `v` using at most the number of flights processed so far.

For each of the `k + 1` allowed flights, copy the current distances into `next`, then relax every flight using only the old distances. Using a copy is essential: it prevents a route from chaining several relaxations within one round, which would exceed the flight budget. After `k + 1` rounds, `dist[dst]` is the cheapest cost using at most `k + 1` flights, which is exactly at most `k` stops.

## Correctness

After `r` rounds, `dist[v]` is the minimum cost of any route from `src` to `v` that uses at most `r` flights. This is true initially for `r = 0`. In round `r + 1`, every route with at most `r + 1` flights either uses at most `r` flights (already represented in the copied value) or ends with a flight `u -> v` after a route of at most `r` flights to `u`. The relaxation considers that last flight and every possible predecessor, so the invariant holds by induction.

Setting `r = k + 1` gives exactly the allowed itineraries. If the destination remains at infinity, no route within the limit exists.

## Complexity

- Time: `O((k + 1) * E)`, where `E` is the number of flights.
- Space: `O(V)` for the two distance arrays.

## Common mistakes

- Relaxing in place, which silently allows more than `k` stops.
- Running only `k` rounds instead of `k + 1` flight rounds.
- Forgetting that a zero-flight trip is valid when the origin equals the destination.
- Assuming the cheapest route always has the fewest flights.
