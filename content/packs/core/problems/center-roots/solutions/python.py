from typing import List
from collections import deque


class Solution:
    def findMinHeightTrees(self, n: int, edges: List[List[int]]) -> List[int]:
        if n == 1:
            return [0]

        neighbors = [set() for _ in range(n)]

        for first, second in edges:
            neighbors[first].add(second)
            neighbors[second].add(first)

        leaves = deque(node for node in range(n) if len(neighbors[node]) == 1)
        remaining = n

        while remaining > 2:
            layer = len(leaves)
            remaining -= layer

            for _ in range(layer):
                leaf = leaves.popleft()

                for neighbor in neighbors[leaf]:
                    neighbors[neighbor].discard(leaf)

                    if len(neighbors[neighbor]) == 1:
                        leaves.append(neighbor)

        return sorted(leaves)
