from typing import List


class Solution:
    def countClusters(self, connected: List[List[int]]) -> int:
        size = len(connected)
        visited = [False] * size
        clusters = 0

        for start in range(size):
            if visited[start]:
                continue

            clusters += 1
            visited[start] = True
            stack = [start]

            while stack:
                node = stack.pop()

                for neighbor in range(size):
                    if connected[node][neighbor] == 1 and not visited[neighbor]:
                        visited[neighbor] = True
                        stack.append(neighbor)

        return clusters
