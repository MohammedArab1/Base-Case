# Explanation

## Approach

Build a directed graph from each prerequisite to the courses that depend on it, along with an indegree count for every course. Put all courses with indegree zero into a min-heap. Repeatedly remove the smallest available course, append it to the order, and decrement the indegree of its dependents. When a dependent reaches zero, insert it into the heap.

If the final order does not contain every course, some courses never became available, which means the graph contains a cycle.

## Correctness

A course enters the heap only after all of its prerequisites have been removed, so every emitted course satisfies its prerequisites. The heap always chooses the smallest currently available label. Suppose a different valid order were lexicographically smaller at the first differing position. At that point both orders must choose among the same zero-indegree courses, and the smallest such label would be at most the other order's choice, contradicting the assumption. Therefore the heap order is lexicographically smallest. If a cycle exists, no course on the cycle ever reaches indegree zero, so fewer than `numCourses` courses are emitted and the algorithm returns an empty list.

## Complexity

Let `V` be the number of courses and `E` the number of prerequisite pairs.

- Time: `O((V + E) log V)`, dominated by heap operations.
- Space: `O(V + E)` for the graph, indegrees, heap, and output.

## Common mistakes

- Using a plain queue, which produces some valid order but not necessarily the lexicographically smallest one.
- Forgetting to check that every course was emitted.
- Reversing the prerequisite pair.
- Counting outgoing edges instead of incoming prerequisites.
