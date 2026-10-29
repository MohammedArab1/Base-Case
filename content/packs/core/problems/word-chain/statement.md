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
Input: begin = "cold", end = "warm", words = ["cord","word","ward","warm"]
Output: 5
```

One shortest sequence is `cold -> cord -> word -> ward -> warm`.

**Example 2**

```
Input: begin = "cat", end = "dog", words = ["cot","dot","dog"]
Output: 4
```

One shortest sequence is `cat -> cot -> dot -> dog`.

**Example 3**

```
Input: begin = "lead", end = "gold", words = ["load","goad","gold"]
Output: 4
```

**Example 4**

```
Input: begin = "abc", end = "xyz", words = ["xbc","xyc","xyz"]
Output: 4
```

**Example 5**

```
Input: begin = "same", end = "some", words = ["same","some"]
Output: 2
```

One letter changes between the endpoints.

## Constraints

- `1 <= begin.length, end.length <= 10`
- `begin.length == end.length == words[i].length`
- `0 <= words.length <= 5,000`
- All words contain lowercase English letters and are distinct.
- `begin != end`

## Follow-up

How can precomputed wildcard patterns avoid trying all 26 letters for every position?
