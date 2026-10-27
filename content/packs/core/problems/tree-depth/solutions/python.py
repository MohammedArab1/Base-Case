class Solution:
    def maxDepth(self, root: TreeNode) -> int:
        if not root:
            return 0

        best = 0
        stack = [(root, 1)]

        while stack:
            node, depth = stack.pop()
            best = max(best, depth)

            if node.left:
                stack.append((node.left, depth + 1))
            if node.right:
                stack.append((node.right, depth + 1))

        return best
