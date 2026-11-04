import heapq


class Solution:
    def alienOrder(self, words: list[str]) -> str:
        letters = sorted(set("".join(words)))
        graph = {letter: set() for letter in letters}
        indegree = {letter: 0 for letter in letters}

        for first, second in zip(words, words[1:]):
            limit = min(len(first), len(second))
            index = 0
            while index < limit and first[index] == second[index]:
                index += 1

            if index == limit:
                if len(first) > len(second):
                    return ""
                continue

            before = first[index]
            after = second[index]
            if after not in graph[before]:
                graph[before].add(after)
                indegree[after] += 1

        available = [letter for letter in letters if indegree[letter] == 0]
        heapq.heapify(available)
        order = []

        while available:
            letter = heapq.heappop(available)
            order.append(letter)
            for after in graph[letter]:
                indegree[after] -= 1
                if indegree[after] == 0:
                    heapq.heappush(available, after)

        if len(order) != len(letters):
            return ""
        return "".join(order)
