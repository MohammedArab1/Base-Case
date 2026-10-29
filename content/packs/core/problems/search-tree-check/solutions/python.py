class Solution:
    def isSearchTree(self, root: TreeNode) -> bool:
        if not root:
            return True

        stack = [(root, float("-inf"), float("inf"))]

        while stack:
            node, low, high = stack.pop()

            if node.val <= low or node.val >= high:
                return False

            if node.left:
                stack.append((node.left, low, node.val))
            if node.right:
                stack.append((node.right, node.val, high))

        return True
