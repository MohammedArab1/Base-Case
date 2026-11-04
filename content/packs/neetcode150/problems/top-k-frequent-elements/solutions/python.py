from collections import Counter
from typing import List


class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        counts = Counter(nums)
        ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
        chosen = [value for value, _ in ranked[:k]]
        return sorted(chosen)
