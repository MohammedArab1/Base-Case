from typing import List


class Solution:
    def generateParentheses(self, n: int) -> List[str]:
        result: List[str] = []
        path: List[str] = []

        def build(opened: int, closed: int) -> None:
            if len(path) == 2 * n:
                result.append("".join(path))
                return

            if opened < n:
                path.append("(")
                build(opened + 1, closed)
                path.pop()

            if closed < opened:
                path.append(")")
                build(opened, closed + 1)
                path.pop()

        build(0, 0)
        result.sort()
        return result
