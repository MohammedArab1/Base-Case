# Explanation

## Approach

Store follow relationships as a map from each user to a set of followees. Store every post in one global timeline as an `(author, tweetId)` pair, appended in publication order.

A feed is produced by scanning that timeline backward. Keep a tweet when its author is the requesting user or is in the user's followee set. Stop after ten matches, which are guaranteed to be the ten newest visible tweets.

## Correctness

The timeline preserves publication order because posts are appended as they occur. Scanning backward visits tweets from newest to oldest, so the first visible tweets collected are exactly the most recent visible ones. The visibility test matches the definition of a feed: the author must be the user or someone the user currently follows. Taking at most ten entries enforces the feed limit. Follow and unfollow update the relationship map directly, and self-relationships are ignored, so every feed reflects the state at the moment it is requested.

## Complexity

Let `T` be the number of posts and `F` the number of feed requests.

- Post, follow, and unfollow each take expected `O(1)` time.
- A feed takes `O(T)` time in the worst case.
- Space is `O(T + R)` for the timeline and relationship sets, plus the output.

## Common mistakes

- Including tweets from users the requesting user does not follow.
- Including tweets older than the ten newest visible tweets.
- Sorting by tweet ID instead of publication order.
- Treating follows as transitive.
- Adding a feed entry for non-feed commands.
- Forgetting that a user always sees their own posts.
