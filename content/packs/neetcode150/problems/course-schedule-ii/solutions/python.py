import heapq
from typing import List


class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses

        for course, prerequisite in prerequisites:
            graph[prerequisite].append(course)
            indegree[course] += 1

        heap = [course for course in range(numCourses) if indegree[course] == 0]
        heapq.heapify(heap)
        order = []

        while heap:
            course = heapq.heappop(heap)
            order.append(course)
            for dependent in graph[course]:
                indegree[dependent] -= 1
                if indegree[dependent] == 0:
                    heapq.heappush(heap, dependent)

        return order if len(order) == numCourses else []
