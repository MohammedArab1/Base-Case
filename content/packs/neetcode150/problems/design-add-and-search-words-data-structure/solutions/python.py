from typing import List


class Solution:
    def dictionaryOperations(self, operations: List[str], words: List[str]) -> List[bool]:
        children = [{}]
        terminal = [False]
        results = []

        def matches(word, position, node):
            if position == len(word):
                return terminal[node]

            ch = word[position]

            if ch == ".":
                for child in children[node].values():
                    if matches(word, position + 1, child):
                        return True
                return False

            child = children[node].get(ch)
            return child is not None and matches(word, position + 1, child)

        for operation, word in zip(operations, words):
            if operation == "addWord":
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
            else:
                results.append(matches(word, 0, 0))

        return results
