# Dictionary with Wildcard Lookup

You are building a small dictionary with two commands. `"addWord"` stores a lowercase word, and `"search"` checks whether any stored word matches a pattern.

In a pattern, `.` stands for exactly one arbitrary lowercase letter. Every other character must match itself, and a pattern matches only a word of the same length.

Given parallel arrays `operations` and `words`, apply `operations[i]` to `words[i]`. Return one boolean per command: every `"addWord"` contributes `true`, and every `"search"` contributes whether its pattern matched at least one stored word.

## Input

- `operations`: a list containing `"addWord"` and `"search"` commands.
- `words`: a list of lowercase words and patterns, one per command.

## Output

A list of booleans, one per command.

## Examples

**Example 1**

```
Input: operations = ["addWord", "search", "search", "search"],
       words = ["harbor", "harbor", "harbour", "h.rb.r"]
Output: [true, true, false, true]
```

The pattern `"h.rb.r"` matches `"harbor"`, while `"harbour"` was never added.

**Example 2**

```
Input: operations = ["addWord", "search", "search", "search"],
       words = ["lantern", "lantern", "l....rn", "l...rn"]
Output: [true, true, true, false]
```

The last pattern has too few dots for a seven-letter word.

**Example 3**

```
Input: operations = ["addWord", "search", "search", "search"],
       words = ["dart", "d..t", "d...", "d...."]
Output: [true, true, true, false]
```

The final pattern contains four dots, so it can only match a five-letter word.

## Constraints

- `1 <= operations.length == words.length <= 1000`
- Stored words contain only lowercase English letters and have length between 1 and 25.
- Patterns contain lowercase English letters and `.` characters and have length between 1 and 25.
- The total length of all words passed to `"addWord"` is at most 10,000.
