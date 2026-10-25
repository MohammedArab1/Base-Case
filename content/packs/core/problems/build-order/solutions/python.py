from collections import deque
from typing import List


class Solution:
    def canBuildAll(self, numModules: int, prerequisites: List[List[int]]) -> bool:
        next_modules: List[List[int]] = [[] for _ in range(numModules)]
        indegree = [0] * numModules

        for module, prerequisite in prerequisites:
            next_modules[prerequisite].append(module)
            indegree[module] += 1

        ready = deque(index for index, count in enumerate(indegree) if count == 0)
        built = 0

        while ready:
            module = ready.popleft()
            built += 1

            for dependent in next_modules[module]:
                indegree[dependent] -= 1
                if indegree[dependent] == 0:
                    ready.append(dependent)

        return built == numModules
