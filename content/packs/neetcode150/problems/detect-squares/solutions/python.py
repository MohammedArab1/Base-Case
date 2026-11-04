from typing import List


class Solution:
    def countSquares(self, points: List[List[int]], queries: List[List[int]]) -> List[int]:
        occupied = {(x, y) for x, y in points}
        answers: List[int] = []

        for x, y, side in queries:
            if (x, y) not in occupied:
                answers.append(0)
                continue

            count = 0
            for dx in (-side, side):
                for dy in (-side, side):
                    corners = (
                        (x, y),
                        (x + dx, y),
                        (x, y + dy),
                        (x + dx, y + dy),
                    )

                    if all(corner in occupied for corner in corners):
                        count += 1

            answers.append(count)

        return answers
