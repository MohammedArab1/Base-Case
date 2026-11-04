class Solution:
    def findCheapestPrice(
        self,
        n: int,
        flights: list[list[int]],
        src: int,
        dst: int,
        k: int,
    ) -> int:
        infinity = float("inf")
        distance = [infinity] * n
        distance[src] = 0

        for _ in range(k + 1):
            next_distance = distance[:]
            for origin, destination, price in flights:
                if distance[origin] == infinity:
                    continue
                candidate = distance[origin] + price
                if candidate < next_distance[destination]:
                    next_distance[destination] = candidate
            distance = next_distance

        return -1 if distance[dst] == infinity else distance[dst]
