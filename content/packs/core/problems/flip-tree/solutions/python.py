class Solution:
    def invertTree(self, root: TreeNode) -> TreeNode:
        if not root:
            return None

        stack = [root]

        while stack:
            node = stack.pop()
            node.left, node.right = node.right, node.left

            if node.left:
                stack.append(node.left)
            if node.right:
                stack.append(node.right)

        return root
