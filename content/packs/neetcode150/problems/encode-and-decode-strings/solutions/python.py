from typing import List


class Solution:
    def runCodec(self, operations: List[str], arguments: List[List[str]]) -> List[List[str]]:
        results: List[List[str]] = []

        for operation, payload in zip(operations, arguments):
            if operation == "encode":
                results.append([self._encode(payload)])
            else:
                results.append(self._decode(payload[0]))

        return results

    def _encode(self, words: List[str]) -> str:
        parts: List[str] = []
        for word in words:
            parts.append(str(len(word)))
            parts.append("#")
            parts.append(word)
        return "".join(parts)

    def _decode(self, encoded: str) -> List[str]:
        words: List[str] = []
        index = 0

        while index < len(encoded):
            marker = encoded.index("#", index)
            length = int(encoded[index:marker])
            start = marker + 1
            words.append(encoded[start : start + length])
            index = start + length

        return words
