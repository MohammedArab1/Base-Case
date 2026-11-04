from typing import List


class Solution:
    def minStack(self, operations: List[str], arguments: List[List[int]]) -> List[int]:
        stack: List[tuple[int, int]] = []
        results: List[int] = []

        for operation, payload in zip(operations, arguments):
            if operation == "push":
                value = payload[0]
                current_min = value if not stack else min(value, stack[-1][1])
                stack.append((value, current_min))
            elif operation == "pop":
                stack.pop()
                results.append(-1)
            elif operation == "top":
                results.append(stack[-1][0])
            else:
                results.append(stack[-1][1])

        return results
