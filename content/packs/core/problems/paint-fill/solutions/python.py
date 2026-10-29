from typing import List


class Solution:
    def floodFill(self, image: List[List[int]], row: int, column: int, color: int) -> List[List[int]]:
        image = [current[:] for current in image]
        old = image[row][column]

        if old == color:
            return image

        rows = len(image)
        columns = len(image[0])
        image[row][column] = color
        stack = [(row, column)]

        while stack:
            r, c = stack.pop()

            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < columns and image[nr][nc] == old:
                    image[nr][nc] = color
                    stack.append((nr, nc))

        return image
