from typing import List


class GraphNode:
    def __init__(self, value):
        self.value = value
        self.neighbors = []


class Solution:
    def cloneGraph(self, adjacency: List[List[int]]) -> List[List[int]]:
        count = len(adjacency)
        if count == 0:
            return []

        originals = [GraphNode(index + 1) for index in range(count)]
        for index, neighbors in enumerate(adjacency):
            for neighbor in neighbors:
                originals[index].neighbors.append(originals[neighbor - 1])

        copies = {}

        def clone(node):
            if node.value in copies:
                return copies[node.value]

            copied = GraphNode(node.value)
            copies[node.value] = copied
            for neighbor in node.neighbors:
                copied.neighbors.append(clone(neighbor))
            return copied

        for node in originals:
            clone(node)

        result = []
        for label in range(1, count + 1):
            result.append(sorted(neighbor.value for neighbor in copies[label].neighbors))
        return result
