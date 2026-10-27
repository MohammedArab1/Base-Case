class Solution:
    def minWindow(self, source: str, target: str) -> str:
        if len(target) > len(source):
            return ""
        if not target:
            return ""

        need = [0] * 26

        for letter in target:
            need[ord(letter) - ord("a")] += 1

        required = sum(1 for count in need if count > 0)
        window = [0] * 26
        formed = 0
        left = 0
        best_start = 0
        best_length = len(source) + 1

        for right, letter in enumerate(source):
            index = ord(letter) - ord("a")
            window[index] += 1

            if need[index] > 0 and window[index] == need[index]:
                formed += 1

            while formed == required:
                length = right - left + 1

                if length < best_length:
                    best_length = length
                    best_start = left

                index = ord(source[left]) - ord("a")
                window[index] -= 1

                if need[index] > 0 and window[index] < need[index]:
                    formed -= 1

                left += 1

        if best_length > len(source):
            return ""

        return source[best_start : best_start + best_length]
