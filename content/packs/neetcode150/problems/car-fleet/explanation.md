# Explanation

## Key insight

Whether a car joins the fleet ahead depends on arrival times, not directly on speeds. A car whose uninterrupted arrival time is later than the fleet ahead cannot catch it: it is effectively slower and becomes the front of a new fleet. A car whose arrival time is earlier would catch the fleet ahead and is forced to slow down, so it joins that fleet and does not add a new arrival time.

## Algorithm

1. Pair each position with its speed.
2. Sort the pairs by position in descending order, so the car closest to the destination is processed first.
3. Initialize `fleets = 0` and `slowest_arrival = -1`.
4. For each car, compute `arrival = (target - position) / speed`.
5. If `arrival > slowest_arrival`, this car forms a new fleet; increment `fleets` and set `slowest_arrival = arrival`.
6. Otherwise the car joins the fleet ahead; do nothing.
7. Return `fleets`.

## Correctness

Process cars in order of decreasing starting position. The fleet directly ahead of the current car is the most recently formed fleet, and its arrival time is `slowest_arrival`. If the current car's free-road arrival time is greater, it would arrive later even without interference, so it cannot catch that fleet and must form a new one. If its arrival time is less than or equal to the fleet's, it reaches the fleet's position before the destination and is forced to travel at the fleet's speed, so it joins that fleet. Thus each new fleet is counted exactly once, and cars that merge are not overcounted.

## Complexity

Let `n` be the number of cars.

- Sorting takes `O(n log n)` time.
- The scan takes `O(n)` time.
- Space is `O(n)` for the sorted pairs. Sorting in place on a list of pairs still uses `O(n)` auxiliary space in the general case.

## Common mistakes

- Iterating from the back of the road toward the destination, which compares each car with the wrong neighbor.
- Comparing speeds directly. A faster car far behind may still arrive after a slower car that is close to the destination.
- Using `>=` when deciding a new fleet. Cars that arrive at exactly the same time belong to the same fleet.
- Forgetting to sort, since `position` is not guaranteed to be ordered.
- Treating a car that catches a fleet as an additional arrival. It merges with the fleet ahead, so the fleet count does not increase.
