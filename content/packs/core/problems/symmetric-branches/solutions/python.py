from collections import deque


class Solution:
    def isSymmetric(self, root: TreeNode) -> bool:
        if root is None:
            return True

        queue = deque([(root.left, root.right)])

        while queue:
            left, right = queue.popleft()

            if left is None and right is None:
                continue
            if left is None or right is None:
                return False
            if left.val != right.val:
                return False

            queue.append((left.left, right.right))
            queue.append((left.right, right.left))

        return True
