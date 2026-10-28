from collections import deque
from typing import Deque, List


class Solution:
    def windowMax(self, nums: List[int], k: int) -> List[int]:
        candidates: Deque[int] = deque()
        answers: List[int] = []

        for index, value in enumerate(nums):
            while candidates and nums[candidates[-1]] <= value:
                candidates.pop()

            candidates.append(index)

            if candidates[0] <= index - k:
                candidates.popleft()

            if index >= k - 1:
                answers.append(nums[candidates[0]])

        return answers
