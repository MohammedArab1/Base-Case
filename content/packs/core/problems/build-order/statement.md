# Build Order

A build system has `numModules` modules numbered from `0` to `numModules - 1`. Each prerequisite pair `[a, b]` means module `b` must be built before module `a`.

Determine whether every module can be built. The prerequisites may contain duplicate pairs, and the dependency graph may be disconnected.

## Input

- `numModules`: the number of modules.
- `prerequisites`: a list of `[a, b]` pairs, where `b` must be built before `a`.

## Output

`true` if there is an order that builds every module exactly once; otherwise `false`.

## Examples

**Example 1**

```
Input: numModules = 4, prerequisites = [[1, 0], [2, 0], [3, 1], [3, 2]]
Output: true
```

Build `0`, then `1` and `2`, then `3`.

**Example 2**

```
Input: numModules = 3, prerequisites = [[0, 1], [1, 2], [2, 0]]
Output: false
```

The three modules form a cycle.

**Example 3**

```
Input: numModules = 1, prerequisites = []
Output: true
```

**Example 4**

```
Input: numModules = 3, prerequisites = [[1, 0], [1, 0]]
Output: true
```

The duplicate prerequisite does not create a second dependency.

**Example 5**

```
Input: numModules = 3, prerequisites = [[1, 0], [2, 1], [0, 2]]
Output: false
```

The dependencies form a cycle.

## Constraints

- `1 <= numModules <= 100,000`
- `0 <= prerequisites.length <= 200,000`
- `prerequisites[i] = [a, b]` with `0 <= a, b < numModules`
- Duplicate prerequisite pairs are allowed.

## Follow-up

Can you also produce one valid build order when the answer is `true`?
