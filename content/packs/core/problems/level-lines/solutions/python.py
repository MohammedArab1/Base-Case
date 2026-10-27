from typing import List


class Solution:
    def levelOrder(self, root: TreeNode) -> List[List[int]]:
        if not root:
            return []

        result: List[List[int]] = []
        current = [root]

        while current:
            values: List[int] = []
            next_level: List[TreeNode] = []

            for node in current:
                values.append(node.val)

                if node.left:
                    next_level.append(node.left)
                if node.right:
                    next_level.append(node.right)

            result.append(values)
            current = next_level

        return result
