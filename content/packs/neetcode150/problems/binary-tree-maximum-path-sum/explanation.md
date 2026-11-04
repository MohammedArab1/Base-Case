# Explanation

## Key insight

A simple path has a unique highest node. Below that node, the path can continue into the left subtree, the right subtree, or both, but once it chooses both it cannot branch again. This suggests a postorder computation that returns the best single downward gain while updating a global best for paths that bend at the current node.

## Algorithm

1. Use a stack of `(node, visited)` pairs and start with `(root, false)`.
2. When a node is popped unvisited, push it back as visited and push its non-null children as unvisited. This produces a postorder.
3. When a node is popped visited, its children's downward gains are already recorded. Clamp each child gain to zero.
4. Update the global best with `node.val + leftGain + rightGain`, which represents the best path bending at this node.
5. Record `node.val + max(leftGain, rightGain)` as the best single downward gain for the parent.
6. Return the global best after the stack empties.

## Correctness

For every node, the algorithm considers the best path whose highest node is that node. The left and right gains are the best non-negative downward contributions from each side. Including both gives the best path that bends there; including neither or one is covered by the clamp and by the same formula at other nodes. The global maximum over all nodes therefore covers every possible simple path. The recorded value is the best single downward continuation, which is exactly what the parent needs.

## Complexity

- Time: `O(n)`, visiting every node once.
- Space: `O(n)` for the gains map and `O(h)` for the traversal stack, where `h` is the tree height.

## Common mistakes

- Allowing a path to branch at more than one node.
- Clamping negative values at the top level only instead of clamping child gains.
- Initializing the best score to zero, which is wrong when every value is negative.
- Returning the global best instead of the best downward gain when reporting to a parent.
- Forgetting that a single node is a valid route.
