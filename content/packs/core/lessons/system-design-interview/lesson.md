# System Design in a Hurry: Introduction

A system design interview asks you to turn a loose prompt into a design you can defend. "Design a URL shortener." "Design a news feed." There is no starter code and no single correct diagram. The interviewer watches how you reason when the problem is open.

This lesson explains what the interview measures and how to use this track. The delivery framework lesson gives a 45-minute sequence.

## What the interview is

A system design interview is a structured design conversation, usually 45 to 60 minutes. You and the interviewer share a document or whiteboard. You ask questions, write requirements, sketch a design, and go deeper where it matters. The interviewer may challenge an assumption or add a constraint partway through.

The work looks like the early design work on a real feature. You decide what the system must do, what it must not do, and how the parts fit. You choose storage, communication, and failure behavior. You explain the cost of each choice.

It is not a trivia quiz. Reciting the internals of a specific database rarely helps unless it answers a question the design raised. It is also not a memorized architecture. Two candidates can draw different boxes and both do well if their reasoning is sound.

## Product design versus infrastructure design

Most prompts fall into one of two groups.

**Product design** starts from a user action. Examples: shortening a link, loading a feed, booking a seat, sending a payment. You model the user flow, the data the product keeps, and the experience the user expects. Success is usually measured in user-visible terms: latency, correctness, availability.

**Infrastructure design** starts from a shared capability. Examples: a rate limiter, a notification service, a job scheduler, a cache layer. Your users are other services. Success is measured in throughput, isolation, operability, and a clean interface for callers.

The same skills apply to both. Product prompts give you more room to discuss the user journey. Infrastructure prompts put more weight on quotas, tenants, and failure containment. Ask which kind of problem you are solving if it is not clear.

## What interviewers assess

Most rubrics group signals into four themes. The names vary, but the ideas do not.

### Problem navigation

Can you turn a vague prompt into a bounded problem? This covers the questions you ask, the requirements you write, the assumptions you state, and the parts you leave out. A strong answer changes direction when the interviewer adds a constraint. A weak answer keeps drawing the plan it prepared.

### Solution design

Can you produce a coherent design that covers the core flows? This covers the entities, the interface, the components, and the data flow between them. The interviewer looks for a design that works end to end before it works at extreme scale.

### Technical excellence

Do you understand why the design works? This covers storage choices, consistency, partitioning, caching, failure handling, and the numbers behind your claims. Depth matters more than breadth here. One careful deep dive beats five shallow mentions.

### Communication and collaboration

Can the interviewer follow your thinking? This covers structure, diagram labels, trade-off statements, and how you respond to hints. It also covers collaboration: do you treat the interviewer as a teammate or as an examiner?

You do not need to be perfect in all four. You need clear signal in each, with one or two areas where you go deeper.

## Why there is no single right answer

A design prompt hides decisions. Is the system read-heavy or write-heavy? Do users need strong consistency, or is a delay of a few seconds acceptable? Is the budget small or large? Each answer changes the design.

Consider a URL shortener. A design for 1,000 links per day fits on one database. A design for 10 million links per day needs a cache, a code-generation plan, and a partitioning scheme. Both can be correct for their stated requirements.

The interviewer is not comparing your diagram with a hidden answer key. They are checking whether your choices follow from your requirements, and whether you can explain what you gave up. Say "I chose this because..." more often than "the right way is...".

## Mid-level versus senior depth

The bar rises with the level, but not in the way candidates expect.

A mid-level answer usually:

- covers one core flow end to end;
- picks reasonable components and explains their roles;
- handles a failure case or two when asked;
- states a trade-off without exploring it deeply.

A senior answer usually:

- narrows the problem with sharper questions;
- designs for the stated scale and says where the first bottleneck appears;
- discusses failure, recovery, and operational cost;
- connects technical choices to product and team consequences;
- leads one or two deep dives and knows when to stop.

Staff-level interviews add more weight to ambiguity, cross-team impact, and long-term evolution. The same habits apply: define the problem, make the design concrete, and defend the trade-offs.

## How this track is organized

The system design part of Base Case follows a track with seven sections.

```text
In a Hurry
  the interview format, preparation, and the delivery sequence

Core Concepts
  scalability, latency, consistency, networking, APIs, and data modeling

Key Technologies
  databases, caches, queues, storage, search, and observability

Common Patterns
  rate limiting, contention, scaling writes, long-running tasks, and real-time updates

Question Breakdowns
  the eight design scenarios in this app

Advanced Topics
  availability, failover, security, and multi-region concerns

In the Wild
  how the same patterns appear in real systems
```

Read the sections in order the first time. Later, use them as reference. Each lesson stands alone, so you can jump to the topic a practice session exposed.

## How to use the lessons and the eight design scenarios

There are eight design scenarios: URL shortener, rate limiter, chat system, news feed, seat reservation, search autocomplete, file sync, and payment ledger. They are ordered roughly from approachable to demanding.

A useful loop:

1. Read a lesson.
2. Attempt a scenario for 45 minutes without notes.
3. Compare your design with the scenario's checklist and rubric.
4. Write down two gaps.
5. Read the lessons that address those gaps.
6. Attempt the scenario again a week later.

Do not read every reference answer first. The point is to practice the conversation, not to memorize a diagram. The rubric tells you what a complete answer covers. The checklist gives you a quick self-review. Use both after your attempt.

## What to do when you are short on time

If an interview is close, prioritize in this order.

1. **Read the delivery framework.** A repeatable sequence prevents the most common failure: a design that starts with boxes and never states the problem.
2. **Practice two scenarios end to end.** Pick one product prompt and one infrastructure prompt. A URL shortener and a rate limiter are good choices.
3. **Prepare your defaults.** Know your usual choices for storage, caching, queues, and failure handling, and know when you would change them.
4. **Rehearse the wrap-up.** A clear summary of trade-offs and next steps is quick to prepare and easy to forget under pressure.

Skip the long tail of technologies. You do not need to know every database. You need to reason clearly with the few you choose.

## What to say in an interview

> "Before I design, I want to agree on the users, the core flows, and the constraints that matter most. I will start with a simple end-to-end design, then go deeper on the part that carries the most risk. I will call out my assumptions and the trade-offs as I make them."

That sentence sets the contract for the next 45 minutes. It tells the interviewer you will navigate the problem, build a coherent solution, show technical depth, and keep the conversation collaborative.
