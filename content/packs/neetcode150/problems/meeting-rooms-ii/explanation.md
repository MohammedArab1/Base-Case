## Approach

The required number of rooms equals the maximum number of bookings active at the same time. Sort the start times and the end times separately.

Sweep through the start times in order with a pointer into the sorted end times. If the earliest ending booking has already finished by the current start, that room can be reused, so advance the end pointer. Otherwise every previously allocated room is still occupied, so one more room is required; increment the room total. The final total is the maximum number of bookings active at once.

## Correctness

At each start time, the end pointer identifies the earliest booking that could free a room. If that end is at or before the current start, reusing the room is valid and optimal. If not, every active booking is still in progress, so an additional room is unavoidable. Processing starts in increasing order ensures the algorithm considers exactly the moments when the active count can increase. Thus the counted rooms equal the maximum overlap, which is both necessary and sufficient.

## Complexity

- Time: `O(n log n)` for the two sorts and `O(n)` for the sweep.
- Space: `O(n)` for the sorted start and end arrays.

## Common mistakes

- Comparing intervals only with their immediate predecessor instead of tracking all active bookings.
- Treating a booking as still active at its end time even though intervals are half-open.
- Forgetting to return `0` for an empty schedule.
- Counting total bookings rather than maximum simultaneous bookings.

## Related pattern

The same sweep counts maximum overlap for intervals and checks whether resource capacity is exceeded.
