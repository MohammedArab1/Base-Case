# Tree Wire Format

A binary tree needs a textual encoding that can be decoded without the original tree. Use this canonical preorder format:

- Walk the tree in preorder: visit a node, then its left subtree, then its right subtree.
- Write each present node's integer value in decimal, using a leading minus sign for negatives and no leading zeros.
- Write `#` for every absent child.
- Separate tokens with commas, with no spaces and no trailing comma.
- Encode an empty tree as the single token `#`.

A decoder reads tokens from left to right. A `#` means "no node". Any other token creates a node with that value, then recursively decodes its left subtree followed by its right subtree.

Given a tree, return its canonical encoding.

## Input

- `root`: the root of a binary tree, or `null`.

## Output

Return the canonical preorder encoding as a `string`.

## Examples

**Example 1**

```
Input: root = [8, 3, 10, 1, 6, null, 14]
Output: "8,3,1,#,#,6,#,#,10,#,14,#,#"
```

**Example 2**

```
Input: root = []
Output: "#"
```

**Example 3**

```
Input: root = [5]
Output: "5,#,#"
```

**Example 4**

```
Input: root = [1, 2, 3, 4]
Output: "1,2,4,#,#,#,3,#,#"
```

## Constraints

- `0 <= number of nodes <= 20,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`
- The encoding must be decodable using only the rules above.

## Follow-up

Write the decoder and verify that decoding your encoding reconstructs the original tree for every possible shape.
