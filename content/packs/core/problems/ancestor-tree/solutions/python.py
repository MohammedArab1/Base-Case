class Solution:
    def lowestCommonAncestor(self, root: TreeNode, first: int, second: int) -> int:
        parents = {root.val: None}
        stack = [root]

        while stack:
            node = stack.pop()

            if node.left:
                parents[node.left.val] = node.val
                stack.append(node.left)
            if node.right:
                parents[node.right.val] = node.val
                stack.append(node.right)

        seen = set()
        value = first

        while value is not None:
            seen.add(value)
            value = parents[value]

        value = second

        while value not in seen:
            value = parents[value]

        return value
