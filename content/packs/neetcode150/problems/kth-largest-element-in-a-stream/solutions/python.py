import heapq
from typing import List


class Solution:
    def kthLargestOperations(
        self, k: int, initial: List[int], additions: List[int]
    ) -> List[int]:
        heap = []

        def add(value):
            heapq.heappush(heap, value)
            if len(heap) > k:
                heapq.heappop(heap)

        for value in initial:
            add(value)

        answers = []
        for value in additions:
            add(value)
            answers.append(heap[0])

        return answers
