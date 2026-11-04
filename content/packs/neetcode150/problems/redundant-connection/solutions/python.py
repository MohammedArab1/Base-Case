from typing import List


class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        count = len(edges)
        parent = list(range(count + 1))
        size = [1] * (count + 1)

        def find(node):
            while parent[node] != node:
                parent[node] = parent[parent[node]]
                node = parent[node]
            return node

        for first, second in edges:
            root_first = find(first)
            root_second = find(second)

            if root_first == root_second:
                return [first, second]

            if size[root_first] < size[root_second]:
                root_first, root_second = root_second, root_first
            parent[root_second] = root_first
            size[root_first] += size[root_second]

        return []
