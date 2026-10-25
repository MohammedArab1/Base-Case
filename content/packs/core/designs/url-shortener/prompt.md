# Design a URL shortener

You are designing the backend for a URL shortening service. Users paste a long URL, receive a short link, and anyone can follow that link to the original destination.

## Scope

Focus on the core create-and-redirect path plus basic click analytics. Authentication, billing, and the web UI are out of scope, but state any assumptions you make about them.

## Requirements

### Functional

- Create a short code for a long URL and return a short link.
- Redirect a short link to the original URL.
- Support optional custom aliases and expiry.
- Show basic click analytics for the owner.

### Non-functional

- Redirects should be fast and highly available.
- Short codes should be hard to guess and collision-safe.
- The system should tolerate hot keys and traffic spikes.
- Analytics may be eventually consistent.

## Scale

- 10 million new links per day.
- 1 billion redirects per day.
- Keep mappings for 5 years.

## What to produce

1. The API surface.
2. The data model and storage choices.
3. A high-level architecture.
4. Two or three deep dives.
5. The main trade-offs.
6. Failure modes and monitoring.
