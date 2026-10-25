import heapq
from typing import List


class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []

        for value in nums:
            heapq.heappush(heap, value)
            if len(heap) > k:
                heapq.heappop(heap)

        return heap[0]
