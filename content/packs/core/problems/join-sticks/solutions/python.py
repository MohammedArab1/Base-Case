import heapq
from typing import List


class Solution:
    def connectCost(self, sticks: List[int]) -> int:
        if len(sticks) <= 1:
            return 0

        heap = list(sticks)
        heapq.heapify(heap)
        total = 0

        while len(heap) > 1:
            first = heapq.heappop(heap)
            second = heapq.heappop(heap)
            combined = first + second
            total += combined
            heapq.heappush(heap, combined)

        return total
