from typing import List


class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums = sorted(nums)
        result: List[List[int]] = []
        count = len(nums)

        for index in range(count - 2):
            if index > 0 and nums[index] == nums[index - 1]:
                continue

            left = index + 1
            right = count - 1

            while left < right:
                total = nums[index] + nums[left] + nums[right]

                if total < 0:
                    left += 1
                elif total > 0:
                    right -= 1
                else:
                    result.append([nums[index], nums[left], nums[right]])
                    left += 1
                    right -= 1

                    while left < right and nums[left] == nums[left - 1]:
                        left += 1
                    while left < right and nums[right] == nums[right + 1]:
                        right -= 1

        return result
