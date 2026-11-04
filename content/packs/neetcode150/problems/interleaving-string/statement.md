# Woven Threads

Two threads contain character sequences. A woven string is formed by repeatedly taking the next character from either the first thread or the second thread and appending it, until both threads are exhausted. Characters inside each thread must be consumed in their original order.

Given the two threads and a candidate woven string, determine whether the candidate can be produced this way.

## Input

- `first`: the first thread.
- `second`: the second thread.
- `woven`: the candidate string to verify.

## Output

`true` if `woven` is an interleaving of `first` and `second`, otherwise `false`.

## Examples

**Example 1**

```
Input: first = "oak", second = "elm", woven = "oelamk"
Output: true
```

**Example 2**

```
Input: first = "", second = "drum", woven = "drum"
Output: true
```

**Example 3**

```
Input: first = "ab", second = "cd", woven = "acbd"
Output: true
```

**Example 4**

```
Input: first = "ab", second = "cd", woven = "abdc"
Output: false
```

## Constraints

- `0 <= first.length, second.length <= 300`
- `0 <= woven.length <= 600`
- All strings consist of lowercase English letters.
