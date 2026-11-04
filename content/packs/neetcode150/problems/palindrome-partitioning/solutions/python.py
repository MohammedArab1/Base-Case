from typing import List


class Solution:
    def partition(self, s: str) -> List[List[str]]:
        result = []
        path = []

        def is_palindrome(left, right):
            while left < right:
                if s[left] != s[right]:
                    return False
                left += 1
                right -= 1
            return True

        def explore(start):
            if start == len(s):
                result.append(path[:])
                return

            for end in range(start, len(s)):
                if is_palindrome(start, end):
                    path.append(s[start:end + 1])
                    explore(end + 1)
                    path.pop()

        explore(0)
        result.sort()
        return result
