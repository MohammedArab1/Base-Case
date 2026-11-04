# Course Ordering with Ties

There are `numCourses` courses labeled from `0` to `numCourses - 1`. Each prerequisite pair `[course, prerequisite]` means `prerequisite` must be completed before `course`.

Return an ordering of all courses that satisfies every prerequisite. Among all valid orderings, return the lexicographically smallest one. If no ordering exists because the prerequisites contain a cycle, return an empty list.

## Input

- `numCourses`: the number of courses.
- `prerequisites`: pairs `[course, prerequisite]`.

## Output

The lexicographically smallest valid course order, or `[]` if none exists.

## Examples

**Example 1**

```
Input: numCourses = 3, prerequisites = [[1, 0], [2, 1]]
Output: [0, 1, 2]
```

**Example 2**

```
Input: numCourses = 6,
       prerequisites = [[2, 0], [3, 1], [4, 2], [5, 3], [5, 4]]
Output: [0, 1, 2, 3, 4, 5]
```

Courses 0 and 1 begin with no prerequisites. At each step the smallest available label is chosen.

**Example 3**

```
Input: numCourses = 3,
       prerequisites = [[0, 1], [1, 2], [2, 0]]
Output: []
```

The prerequisites form a cycle.

## Constraints

- `1 <= numCourses <= 200`
- `0 <= prerequisites.length <= 1000`
- Each pair has two distinct course labels in `[0, numCourses - 1]`.
- Pairs are distinct.
