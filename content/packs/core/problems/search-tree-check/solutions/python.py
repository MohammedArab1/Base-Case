class Solution:
    def isSearchTree(self, root: TreeNode) -> bool:
        def valid(node: TreeNode, low: float, high: float) -> bool:
            if not node:
                return True

            if node.val <= low or node.val >= high:
                return False

            return valid(node.left, low, node.val) and valid(node.right, node.val, high)

        return valid(root, float("-inf"), float("inf"))
