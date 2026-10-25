# Design a news feed

You are designing the feed for a social product. Users follow other users, publish posts, and open a ranked feed several times a day.

## Scope

Focus on the follow graph, post storage, feed generation, ranking, and pagination. Direct messaging, ads, and live video are out of scope, but state any assumptions you make about them.

## Requirements

### Functional

- Let users follow and unfollow other users.
- Show a ranked feed of posts from followed users.
- Create posts with text and optional media references.
- Show like and comment counts on posts.
- Support cursor pagination and a new-posts indicator.
- Let users hide or block accounts.

### Non-functional

- Keep feed reads fast at very high volume.
- Accept a few seconds of eventual consistency for new posts and counts.
- Persist posts durably and keep them available for years.
- Keep the feed useful when ranking or fan-out services are degraded.
- Scale to a large daily audience without per-read fan-out for most users.

## Scale

- 20 million writes per day across posts, follows, likes, and comments.
- 50 billion feed reads per day.
- Keep posts and feed entries for 2 years.

## What to produce

1. The follow graph and feed membership model.
2. The post schema and storage choices.
3. The fan-out strategy.
4. Feed caching, ranking, and pagination.
5. The main trade-offs.
6. Failure modes and monitoring.
