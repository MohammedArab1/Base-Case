from typing import List


class Solution:
    def trieOperations(self, operations: List[str], words: List[str]) -> List[bool]:
        children = [{}]
        terminal = [False]
        results = []

        def find(word):
            node = 0
            for ch in word:
                if ch not in children[node]:
                    return -1
                node = children[node][ch]
            return node

        for operation, word in zip(operations, words):
            if operation == "insert":
                node = 0
                for ch in word:
                    next_node = children[node].get(ch)
                    if next_node is None:
                        next_node = len(children)
                        children[node][ch] = next_node
                        children.append({})
                        terminal.append(False)
                    node = next_node
                terminal[node] = True
                results.append(True)
            elif operation == "search":
                node = find(word)
                results.append(node != -1 and terminal[node])
            else:
                results.append(find(word) != -1)

        return results
