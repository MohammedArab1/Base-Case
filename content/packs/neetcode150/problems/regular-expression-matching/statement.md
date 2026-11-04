# Pattern Match with Wildcards

A pattern language supports two wildcards:

- `.` matches any single character;
- `*` matches zero or more copies of the character immediately before it.

The pattern must describe the entire candidate string, not just a prefix or substring. Patterns are valid: `*` always follows a lowercase letter or `.`, and two stars never appear consecutively. Return whether the pattern matches the whole string.

## Input

- `s`: the candidate string, possibly empty.
- `p`: the pattern, possibly empty, made of lowercase letters, dots, and stars.

## Output

Return `true` if `p` matches all of `s`, and `false` otherwise.

## Examples

**Example 1**

```
Input: s = "abc", p = "a.c"
Output: true
```

The dot matches b.

**Example 2**

```
Input: s = "abc", p = "a.c*"
Output: true
```

The dot matches b, and c* consumes the final c.

**Example 3**

```
Input: s = "ab", p = ".*c"
Output: false
```

The pattern can consume a and b, but it still requires a c.

**Example 4**

```
Input: s = "", p = "a*"
Output: true
```

a* may match zero copies, so the empty string matches the empty remainder of the pattern.

## Constraints

- `0 <= s.length <= 30`
- `0 <= p.length <= 30`
- `s` contains only lowercase English letters.
- `p` is a valid pattern using lowercase letters, `.`, and `*`.

## Follow-up

How would you extend the pattern language to support `+` for one or more copies?
