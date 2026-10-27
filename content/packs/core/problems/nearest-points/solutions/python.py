from typing import List


class Solution:
    def closestPoints(self, points: List[List[int]], k: int) -> List[List[int]]:
        ordered = sorted(points, key=lambda point: (point[0] * point[0] + point[1] * point[1], point[0], point[1]))
        return ordered[:k]
