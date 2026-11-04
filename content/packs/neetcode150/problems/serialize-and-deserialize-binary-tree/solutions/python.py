class Solution:
    def serializeTree(self, root: TreeNode) -> str:
        tokens: list[str] = []
        stack = [root]

        while stack:
            node = stack.pop()
            if not node:
                tokens.append("#")
                continue
            tokens.append(str(node.val))
            stack.append(node.right)
            stack.append(node.left)

        return ",".join(tokens)
