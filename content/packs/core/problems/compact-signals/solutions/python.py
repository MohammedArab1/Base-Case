from typing import List


class Solution:
    def compactSignals(self, signals: List[int]) -> int:
        if not signals:
            return 0

        write = 1

        for read in range(1, len(signals)):
            if signals[read] != signals[write - 1]:
                signals[write] = signals[read]
                write += 1

        del signals[write:]
        return write
