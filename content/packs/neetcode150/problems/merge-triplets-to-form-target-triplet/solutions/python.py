from typing import List


class Solution:
    def canForm(self, triplets: List[List[int]], target: List[int]) -> bool:
        best = [0, 0, 0]

        for card in triplets:
            if all(card[position] <= target[position] for position in range(3)):
                for position in range(3):
                    best[position] = max(best[position], card[position])

        return best == target
