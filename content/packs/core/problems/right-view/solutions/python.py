from typing import List


class Solution:
    def rightSideView(self, root: TreeNode) -> List[int]:
        if not root:
            return []

        result: List[int] = []
        current = [root]

        while current:
            result.append(current[-1].val)
            next_level: List[TreeNode] = []

            for node in current:
                if node.left:
                    next_level.append(node.left)
                if node.right:
                    next_level.append(node.right)

            current = next_level

        return result
