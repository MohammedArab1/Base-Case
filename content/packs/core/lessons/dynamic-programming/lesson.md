# Dynamic Programming

Dynamic programming (DP) is a way to avoid solving the same smaller problem twice.

Start with a recursive idea. If the recursion keeps asking the same questions, store the answers. That is **memoization**. If you can order the questions from smallest to largest, fill a table. That is **tabulation**. Both are DP.

## The two required properties

1. **Overlapping subproblems**: the same smaller problem appears again and again.
2. **Optimal substructure**: an optimal answer can be built from optimal answers to smaller problems.

Naive Fibonacci has both:

```text
fib(5)
  fib(4)
    fib(3)
      fib(2)
      fib(1)
    fib(2)   <- repeated
  fib(3)     <- repeated
```

The repeated calls make it `O(2ⁿ)`. Caching each result makes it `O(n)`.

## Define the state first

The state is the sentence that makes the rest of the solution obvious.

> `dp[i]` is the number of ways to reach step `i`.

Once you have that, the transition is a question: **which smaller states can reach `i`?**

```text
dp[i] = dp[i - 1] + dp[i - 2]
```

Base cases:

```text
dp[0] = 1
dp[1] = 1
```

That is **Stair Count**. The state definition did most of the work.

## A 1D table

**Coin Count** asks for the fewest coins that add up to a target.

> `dp[amount]` is the fewest coins needed to make that amount.

```text
coins = [1, 2, 5], amount = 7

dp[0] = 0

dp[1] = dp[0] + 1 = 1
dp[2] = min(dp[1] + 1, dp[0] + 1) = 1
dp[3] = min(dp[2] + 1, dp[1] + 1) = 2
dp[4] = min(dp[3] + 1, dp[2] + 1) = 2
dp[5] = 1
dp[6] = 2
dp[7] = min(dp[6] + 1, dp[5] + 1, dp[2] + 1) = 2
```

The transition is:

```text
dp[a] = min(dp[a - coin] + 1) for every coin <= a
```

If no coin fits, leave the value at infinity.

## A 2D table

**Edit Ledger** transforms one string into another with insertions, deletions, and replacements.

> `dp[i][j]` is the minimum edits to turn the first `i` characters of `word1` into the first `j` characters of `word2`.

```text
        ""  c  a  t
   ""    0  1  2  3
   c     1  0  1  2
   a     2  1  0  1
   r     3  2  1  1
   t     4  3  2  1
```

`word1 = "cart"` is shown on the rows and `word2 = "cat"` on the columns. The first column is `0, 1, 2, 3, 4` because deleting all `i` characters costs `i` edits.

If the current characters match, the cost carries over diagonally:

```text
dp[i][j] = dp[i-1][j-1]
```

Otherwise take the cheapest of three options and add one:

```text
insert:    dp[i][j-1] + 1
delete:    dp[i-1][j] + 1
replace:   dp[i-1][j-1] + 1
```

The table has `(n + 1) * (m + 1)` cells, so time and space are `O(n * m)`. Because each row only needs the previous row, space can drop to `O(m)`.

## Space optimization

Look at which previous cells the transition reads.

- If it reads only the previous row and the current row, keep two rows.
- If it reads only the previous cell and a diagonal, keep a few variables.
- If it reads the whole table, keep the table.

Do not optimize until the full version is correct. A correct `O(n * m)` table is better than a clever `O(m)` table with a bug.

## Common DP families

- **Linear**: stairs, house robber, maximum subarray.
- **Knapsack**: choose items with a weight or capacity limit.
- **String**: edit distance, longest common subsequence, palindromic substrings.
- **Grid**: paths, minimum path sum.
- **Interval**: burst balloons, matrix chain multiplication.
- **Bitmask**: subsets of up to about 20 items.

## The interview rhythm

1. Define the state in one sentence.
2. Write the transition.
3. Write the base cases.
4. Pick an iteration order.
5. Check a tiny example by hand.
6. Then optimize space.

If the state sentence is fuzzy, stop and fix it. Most DP bugs are actually state-definition bugs.
