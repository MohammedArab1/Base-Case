class Solution:
    def minCostConnectPoints(self, points: list[list[int]]) -> int:
        n = len(points)
        if n <= 1:
            return 0

        visited = [False] * n
        best = [float("inf")] * n
        best[0] = 0
        total = 0

        for _ in range(n):
            current = -1
            for index in range(n):
                if not visited[index] and (current == -1 or best[index] < best[current]):
                    current = index

            visited[current] = True
            total += best[current]
            x, y = points[current]

            for other in range(n):
                if not visited[other]:
                    distance = abs(x - points[other][0]) + abs(y - points[other][1])
                    if distance < best[other]:
                        best[other] = distance

        return total
