# Smallest Ticket Chain

A travel desk keeps a pile of one-way tickets. Each ticket is a pair `[from, to]` of three-letter airport codes. Every ticket must be used exactly once, forming one continuous chain that begins at `JFK`.

Many chains can use the same tickets. Return the lexicographically smallest chain, comparing airport codes in order as ordinary strings. A chain with a smaller airport at the first position where two chains differ is the smaller chain.

The tickets are guaranteed to admit at least one complete chain.

## Input

- `tickets`: a list of `[from, to]` airport-code pairs. The same pair may appear more than once.

## Output

Return the lexicographically smallest itinerary as a list of airport codes. The list contains one more code than there are tickets and starts with `"JFK"`.

## Examples

**Example 1**

```
Input: tickets = [["JFK", "SFO"], ["SFO", "LAX"], ["LAX", "JFK"], ["JFK", "LAX"]]
Output: ["JFK", "LAX", "JFK", "SFO", "LAX"]
```

The itinerary that starts with the LAX ticket is smaller at the second airport than the alternative that starts through SFO.

**Example 2**

```
Input: tickets = [["JFK", "AMS"], ["AMS", "JFK"], ["JFK", "BER"]]
Output: ["JFK", "AMS", "JFK", "BER"]
```

The only complete chain uses all three tickets in the order shown.

**Example 3**

```
Input: tickets = [["JFK", "PAR"], ["JFK", "PAR"], ["PAR", "JFK"]]
Output: ["JFK", "PAR", "JFK", "PAR"]
```

The duplicate tickets represent separate flights and both are used.

**Example 4**

```
Input: tickets = [["JFK", "ZRH"]]
Output: ["JFK", "ZRH"]
```

With one ticket there is only one possible chain.

## Constraints

- `1 <= tickets.length <= 200`
- Each airport code is exactly three uppercase English letters.
- Each ticket can be used only once, even when several tickets share the same endpoints.
- At least one chain uses every ticket exactly once.

## Follow-up

How would you find the lexicographically smallest chain if the starting airport were supplied as part of the input?
