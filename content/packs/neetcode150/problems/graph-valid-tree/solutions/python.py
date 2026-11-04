from typing import List


class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        if len(edges) != n - 1:
            return False

        parent = list(range(n))
        size = [1] * n

        def find(node):
            while parent[node] != node:
                parent[node] = parent[parent[node]]
                node = parent[node]
            return node

        for first, second in edges:
            root_first = find(first)
            root_second = find(second)

            if root_first == root_second:
                return False

            if size[root_first] < size[root_second]:
                root_first, root_second = root_second, root_first
            parent[root_second] = root_first
            size[root_first] += size[root_second]

        return True
