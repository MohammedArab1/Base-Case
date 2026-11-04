# Explanation

## Key insight

Preorder visits a node before its subtrees, but the boundaries between subtrees are ambiguous unless absent children are represented explicitly. Writing a marker for every missing child makes the token stream self-delimiting.

## Algorithm

1. Push the root onto a stack.
2. Pop a node. If it is null, append `#`.
3. Otherwise append its decimal value, then push the right child and the left child (in that order) so the left subtree is processed first.
4. Continue until the stack is empty, then join the tokens with commas.

## Correctness

Preorder emits a node before either subtree. The two markers after a leaf tell the decoder that both children are absent. More generally, after reading a value the decoder recursively consumes exactly the tokens for the left subtree and then exactly the tokens for the right subtree, because each subtree is itself a complete preorder encoding. This makes the grammar unambiguous. By induction on tree height, decoding the produced string reconstructs the original tree, and the encoder returns exactly the canonical string required.

## Complexity

- Time: `O(n)`, visiting each node and each missing-child slot a constant number of times.
- Space: `O(n)` for the token list and `O(h)` for the traversal stack, where `h` is the tree height.

## Common mistakes

- Omitting markers for missing children, which makes the encoding ambiguous.
- Writing only one marker for a node with one child.
- Adding a trailing comma.
- Encoding an empty tree as an empty string instead of `#`.
- Choosing a separator that can also occur inside a token.
