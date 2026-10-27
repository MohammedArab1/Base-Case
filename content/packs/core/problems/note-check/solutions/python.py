class Solution:
    def canCompose(self, note: str, source: str) -> bool:
        if len(note) > len(source):
            return False

        counts = [0] * 26

        for letter in source:
            counts[ord(letter) - ord("a")] += 1

        for letter in note:
            index = ord(letter) - ord("a")
            if counts[index] == 0:
                return False
            counts[index] -= 1

        return True
