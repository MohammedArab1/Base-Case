class Solution:
    def diameter(self, root: TreeNode) -> int:
        if not root:
            return 0

        heights = {}
        best = 0
        stack = [(root, False)]

        while stack:
            node, visited = stack.pop()

            if not node:
                continue

            if visited:
                left = heights.get(node.left, 0)
                right = heights.get(node.right, 0)
                best = max(best, left + right)
                heights[node] = 1 + max(left, right)
            else:
                stack.append((node, True))
                stack.append((node.left, False))
                stack.append((node.right, False))

        return best
