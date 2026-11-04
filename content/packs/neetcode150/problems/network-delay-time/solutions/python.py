import heapq


class Solution:
    def networkDelayTime(self, n: int, times: list[list[int]], k: int) -> int:
        graph = [[] for _ in range(n + 1)]
        for source, destination, weight in times:
            graph[source].append((destination, weight))

        infinity = float("inf")
        distance = [infinity] * (n + 1)
        distance[k] = 0
        heap = [(0, k)]

        while heap:
            time, node = heapq.heappop(heap)
            if time != distance[node]:
                continue
            for destination, weight in graph[node]:
                candidate = time + weight
                if candidate < distance[destination]:
                    distance[destination] = candidate
                    heapq.heappush(heap, (candidate, destination))

        answer = max(distance[1:])
        return -1 if answer == infinity else answer
