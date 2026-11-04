from typing import List


class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        if not board or not board[0]:
            return []

        children = [{}]
        terminal = [None]

        for word in words:
            node = 0
            for ch in word:
                next_node = children[node].get(ch)
                if next_node is None:
                    next_node = len(children)
                    children[node][ch] = next_node
                    children.append({})
                    terminal.append(None)
                node = next_node
            terminal[node] = word

        rows, cols = len(board), len(board[0])
        grid = [row[:] for row in board]
        found = set()

        def visit(row, col, node):
            ch = grid[row][col]
            next_node = children[node].get(ch)
            if next_node is None:
                return

            if terminal[next_node] is not None:
                found.add(terminal[next_node])

            grid[row][col] = "#"
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                next_row, next_col = row + dr, col + dc
                if (
                    0 <= next_row < rows
                    and 0 <= next_col < cols
                    and grid[next_row][next_col] != "#"
                ):
                    visit(next_row, next_col, next_node)
            grid[row][col] = ch

        for row in range(rows):
            for col in range(cols):
                visit(row, col, 0)

        return sorted(found)
