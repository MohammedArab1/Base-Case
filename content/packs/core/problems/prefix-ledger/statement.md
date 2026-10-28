# Prefix Ledger

You are maintaining a searchable ledger of short words. For each query string, count how many ledger entries start with that string.

A prefix does not have to be a whole word. For example, `"ap"` is a prefix of `"apple"`, `"app"`, and `"apricot"`. Duplicate words in `words` are separate entries and count separately. An empty query is a prefix of every entry.

## Input

- `words`: a list of lowercase words.
- `queries`: a list of lowercase prefixes.

## Output

A list of integers where the value at index `i` is the number of words that start with `queries[i]`.

## Examples

**Example 1**

```
Input: words = ["apple", "app", "apricot", "banana"],
       queries = ["ap", "app", "ban", "z"]
Output: [3, 2, 1, 0]
```

Three words start with `"ap"`, two start with `"app"`, one starts with `"ban"`, and none start with `"z"`.

**Example 2**

```
Input: words = ["a", "a", "ab"], queries = ["a", "ab", "abc"]
Output: [3, 1, 0]
```

The word `"a"` appears twice, so both copies count toward the prefix `"a"`. Only `"ab"` starts with `"ab"`, and nothing starts with `"abc"`.

**Example 3**

```
Input: words = ["code", "coder", "coding", "dog"],
       queries = ["co", "cod", "code", "d"]
Output: [3, 3, 2, 1]
```

All three code-related words start with `"cod"`, but only `"code"` and `"coder"` start with `"code"`.

**Example 4**

```
Input: words = ["x"], queries = ["x"]
Output: [1]
```

## Constraints

- `0 <= words.length <= 50,000`
- `1 <= queries.length <= 50,000`
- Each word and query contains only lowercase English letters.
- The total number of characters across all words and queries is at most `200,000`.
- A query may be empty. It matches every word.
- Every query must run in time proportional to its length, not to the number of words.

## Follow-up

How would you support deleting a word from the ledger? Which counters would need to change?
