from typing import List
import heapq


class Solution:
    def smallestSpans(self, intervals: List[List[int]], queries: List[int]) -> List[int]:
        ordered = sorted(intervals, key=lambda interval: interval[0])
        query_order = sorted(range(len(queries)), key=lambda index: queries[index])
        answers = [-1] * len(queries)
        heap: List[tuple[int, int]] = []
        next_interval = 0

        for query_index in query_order:
            query = queries[query_index]

            while next_interval < len(ordered) and ordered[next_interval][0] <= query:
                start, end = ordered[next_interval]
                heapq.heappush(heap, (end - start + 1, end))
                next_interval += 1

            while heap and heap[0][1] < query:
                heapq.heappop(heap)

            if heap:
                answers[query_index] = heap[0][0]

        return answers
