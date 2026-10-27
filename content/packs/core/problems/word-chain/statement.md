# Word Chain

Transform `begin` into `end` by changing one letter at a time. Every intermediate word must appear in `words`, and each word may be used at most once. `begin` does not need to be in the list.

Return the number of words in the shortest transformation sequence, counting both endpoints, or `0` if no sequence exists.

## Input

- `begin`: the starting word.
- `end`: the target word.
- `words`: an unordered list of allowed words.

## Output

The shortest sequence length, or `0`.

## Examples

**Example 1**

```
Input: begin = "hit", end = "cog", words = ["hot","dot","dog","lot","log","cog"]
Output: 5
```

One shortest sequence is `hit -> hot -> dot -> dog -> cog`.

**Example 2**

```
Input: begin = "hit", end = "cog", words = ["hot","dot","dog","lot","log"]
Output: 0
```

The target is not available.

**Example 3**

```
Input: begin = "a", end = "c", words = ["a","b","c"]
Output: 2
```

`a -> c` changes one letter.

## Constraints

- `1 <= begin.length, end.length <= 10`
- `begin.length == end.length == words[i].length`
- `0 <= words.length <= 5,000`
- All words contain lowercase English letters and are distinct.
- `begin != end`

## Follow-up

How can precomputed wildcard patterns avoid trying all 26 letters for every position?
