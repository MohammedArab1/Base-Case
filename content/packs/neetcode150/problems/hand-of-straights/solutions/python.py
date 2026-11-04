from typing import List
from collections import Counter


class Solution:
    def canGroup(self, hand: List[int], groupSize: int) -> bool:
        if len(hand) % groupSize != 0:
            return False

        counts = Counter(hand)

        for value in sorted(counts):
            amount = counts[value]

            if amount == 0:
                continue

            for offset in range(groupSize):
                needed = value + offset

                if counts[needed] < amount:
                    return False

                counts[needed] -= amount

        return True
