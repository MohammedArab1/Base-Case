from typing import Dict, List


class _TrieNode:
    __slots__ = ("count", "children")

    def __init__(self) -> None:
        self.count = 0
        self.children: Dict[str, "_TrieNode"] = {}


class Solution:
    def prefixCounts(self, words: List[str], queries: List[str]) -> List[int]:
        # Every node stores how many words passed through it. The root count
        # includes every word, so an empty query works without a special case.
        root = _TrieNode()

        for word in words:
            node = root
            node.count += 1

            for character in word:
                child = node.children.get(character)
                if child is None:
                    child = _TrieNode()
                    node.children[character] = child
                node = child
                node.count += 1

        answers: List[int] = []

        for query in queries:
            node = root

            for character in query:
                child = node.children.get(character)
                if child is None:
                    answers.append(0)
                    break
                node = child
            else:
                answers.append(node.count)

        return answers
