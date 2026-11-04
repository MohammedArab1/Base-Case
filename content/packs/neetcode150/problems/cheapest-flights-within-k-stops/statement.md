# Budget Flights with Stop Limits

A traveler is planning a trip through a set of cities numbered `0` through `n - 1`. Each available flight `flights[i] = [from, to, price]` is one-way and has a fixed ticket price.

The traveler may take at most `k` intermediate stops. A stop is any city visited between the origin and the destination, so a trip with `s` stops uses `s + 1` flights. Return the lowest total ticket price from `src` to `dst`. If no trip within the stop limit exists, return `-1`. A trip with no flights costs `0` and is allowed when `src` equals `dst`.

## Input

- `n`: the number of cities.
- `flights`: one-way flights in the form `[from, to, price]`.
- `src`: the starting city.
- `dst`: the destination city.
- `k`: the maximum number of intermediate stops.

## Output

Return the cheapest total price from `src` to `dst` using at most `k` stops, or `-1` when no such trip exists.

## Examples

**Example 1**

```
Input: n = 4, flights = [[0, 1, 120], [1, 2, 90], [2, 3, 70], [0, 3, 500]], src = 0, dst = 3, k = 2
Output: 280
```

Using two stops, the route 0 -> 1 -> 2 -> 3 costs 280, which beats the direct flight.

**Example 2**

```
Input: n = 4, flights = [[0, 1, 120], [1, 2, 90], [2, 3, 70], [0, 3, 500]], src = 0, dst = 3, k = 1
Output: 500
```

With only one stop allowed, the three-flight route is unavailable, so the direct flight costs 500.

**Example 3**

```
Input: n = 3, flights = [[0, 1, 200], [1, 2, 100]], src = 0, dst = 2, k = 0
Output: -1
```

The trip needs two flights, but `k = 0` allows only one.

**Example 4**

```
Input: n = 2, flights = [[0, 1, 50]], src = 0, dst = 0, k = 0
Output: 0
```

The origin is already the destination, so no ticket is needed.

## Constraints

- `1 <= n <= 100`
- `0 <= flights.length <= 5,000`
- `0 <= from, to, src, dst < n`
- `0 <= price <= 10,000`
- `0 <= k <= 100`
- Parallel flights between the same pair of cities are allowed.

## Follow-up

How would you reconstruct the cheapest itinerary, and how would you break ties between equally priced routes?
