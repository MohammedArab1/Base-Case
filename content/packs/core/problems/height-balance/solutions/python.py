class Solution:
    def isBalanced(self, root: TreeNode) -> bool:
        if not root:
            return True

        heights = {}
        stack = [(root, False)]

        while stack:
            node, visited = stack.pop()

            if not node:
                continue

            if visited:
                left = heights.get(node.left, 0)
                right = heights.get(node.right, 0)

                if abs(left - right) > 1:
                    return False

                heights[node] = 1 + max(left, right)
            else:
                stack.append((node, True))
                stack.append((node.left, False))
                stack.append((node.right, False))

        return True
