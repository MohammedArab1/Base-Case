class Solution:
    def goodNodes(self, root: TreeNode) -> int:
        if not root:
            return 0

        count = 0
        stack = [(root, root.val)]

        while stack:
            node, maximum = stack.pop()
            if node.val >= maximum:
                count += 1
            next_maximum = max(maximum, node.val)
            if node.left:
                stack.append((node.left, next_maximum))
            if node.right:
                stack.append((node.right, next_maximum))

        return count
