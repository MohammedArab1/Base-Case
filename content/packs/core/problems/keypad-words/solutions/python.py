from typing import List


class Solution:
    def letterWords(self, digits: str) -> List[str]:
        mapping = {
            "2": "abc",
            "3": "def",
            "4": "ghi",
            "5": "jkl",
            "6": "mno",
            "7": "pqrs",
            "8": "tuv",
            "9": "wxyz",
        }
        words: List[str] = []

        def walk(index: int, prefix: str) -> None:
            if index == len(digits):
                words.append(prefix)
                return

            for letter in mapping[digits[index]]:
                walk(index + 1, prefix + letter)

        walk(0, "")
        return words
