class _RandomNode:
    def __init__(self, value: int) -> None:
        self.value = value
        self.next = None
        self.random = None


class Solution:
    def copyRandomList(self, values: list[int], random: list[int]) -> list[list[int]]:
        if not values:
            return []

        originals = [_RandomNode(value) for value in values]
        for index in range(len(originals) - 1):
            originals[index].next = originals[index + 1]
        for index, target in enumerate(random):
            if target != -1:
                originals[index].random = originals[target]

        copies = [_RandomNode(value) for value in values]
        for index in range(len(copies) - 1):
            copies[index].next = copies[index + 1]
        for index, target in enumerate(random):
            if target != -1:
                copies[index].random = copies[target]

        position = {id(node): index for index, node in enumerate(copies)}
        result = []
        node = copies[0]
        while node:
            target = -1 if node.random is None else position[id(node.random)]
            result.append([node.value, target])
            node = node.next

        return result
