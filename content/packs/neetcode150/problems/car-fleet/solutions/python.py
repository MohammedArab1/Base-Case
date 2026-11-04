from typing import List


class Solution:
    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:
        cars = sorted(zip(position, speed), reverse=True)
        fleets = 0
        slowest_arrival = 0.0

        for start, rate in cars:
            arrival = (target - start) / rate
            if arrival > slowest_arrival:
                fleets += 1
                slowest_arrival = arrival

        return fleets
