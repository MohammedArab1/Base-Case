# Social Feed Simulator

Simulate a simple social network. Users are identified by integers, and posts are identified by distinct tweet IDs. Each post is published by one user and enters a single global timeline in publication order.

You are given parallel arrays describing a sequence of commands.

- `"post"` with `[userId, tweetId]`: publish a tweet as `userId`.
- `"follow"` with `[followerId, followeeId]`: make `followerId` follow `followeeId`.
- `"unfollow"` with `[followerId, followeeId]`: remove that follow relationship if it exists.
- `"feed"` with `[userId]`: request the user's feed.

A feed contains tweets written by the user and by every user they currently follow. It is ordered by publication time, newest first, and contains at most 10 tweets. Following yourself or unfollowing yourself has no effect.

Return one array for each `"feed"` command, in the order the feed commands appear. Commands other than `"feed"` contribute no entry.

## Input

- `operations`: a list of command names.
- `arguments`: a list of integer arrays, one per command.

## Output

A list of feeds. Each feed is a list of tweet IDs, newest first, with at most 10 entries.

## Examples

**Example 1**

```
Input: operations = ["post", "post", "post", "feed", "follow", "feed", "unfollow", "feed"],
       arguments  = [[2, 41], [5, 52], [2, 63], [2], [2, 5], [2], [2, 5], [2]]
Output: [[63, 41], [63, 52, 41], [63, 41]]
```

User 2 sees only their own tweets before following user 5, then sees tweet 52 between them, then loses it after unfollowing.

**Example 2**

```
Input: operations = ["post", "post", "post", "feed"],
       arguments  = [[3, 11], [3, 12], [4, 13], [3]]
Output: [[12, 11]]
```

Only user 3's own posts appear in this feed.

**Example 3**

```
Input: operations = ["post", "follow", "post", "feed"],
       arguments  = [[1, 10], [2, 1], [2, 20], [2]]
Output: [[20, 10]]
```

## Constraints

- `1 <= operations.length == arguments.length <= 500`
- Every operation name is `"post"`, `"follow"`, `"unfollow"`, or `"feed"`.
- `0 <= userId <= 1000`
- `0 <= tweetId <= 1,000,000,000`; tweet IDs are distinct.
- Every feed request has at least one argument. The other commands have exactly the arguments described above.
