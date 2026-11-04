class Solution:
    def maxPathSum(self, root: TreeNode) -> int:
        best = float("-inf")
        gains: dict[TreeNode, int] = {}
        stack = [(root, False)]

        while stack:
            node, visited = stack.pop()
            if visited:
                left = max(gains.get(node.left, 0), 0)
                right = max(gains.get(node.right, 0), 0)
                best = max(best, node.val + left + right)
                gains[node] = node.val + max(left, right)
            else:
                stack.append((node, True))
                if node.right:
                    stack.append((node.right, False))
                if node.left:
                    stack.append((node.left, False))

        return int(best)
