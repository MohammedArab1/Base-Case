# The Delivery Framework

A 45-minute system design interview goes fast. A fixed sequence keeps you from spending 20 minutes on requirements or 30 minutes on boxes. This lesson gives a path from a vague prompt to a defended design, and says where estimation helps.

## The sequence at a glance

```text
1. Requirements          5-8 min
2. Estimation            optional, 2-3 min
3. Core entities         3-5 min
4. API / interface       5-7 min
5. Data flow             optional, 2-3 min
6. High-level design     10-15 min
7. Deep dives            about 10 min
8. Wrap-up               3-5 min
```

The numbers are guides. Order matters more than exact minutes: requirements before components, interface before internals, deep dives after a working end-to-end sketch.

## Step 1: Requirements

Write three short lists.

**Functional requirements** are the actions the system supports. Use user language.

```text
URL shortener:
- create a short link from a long URL
- redirect a short code to its target
- let the owner see click counts
- let a link expire
```

**Non-functional requirements** are the qualities the system must have. Put a number on each one when you can.

```text
URL shortener:
- redirect p95 latency under 100 ms
- 99.9% availability for redirects
- a created link survives a node failure
- a new link is visible to its creator immediately
- analytics may lag by up to one minute
```

**Constraints** are the top three to five facts that shape the design. Examples: read-to-write ratio, traffic profile, retention, budget, and regulatory region. Write them as assumptions if the interviewer does not know.

What this step produces: a bounded problem. You should know what is in scope, what is out, and which quality matters most. Three to five functional requirements are enough. A long feature list is a scope problem.

Ask questions that change the design. "Is it read-heavy?" matters more than "how many users?" and "does a stale read break the product?" If the interviewer says "you decide", decide out loud.

## Step 2: Estimation, only when it changes a decision

Capacity math is useful, and easy to overdo. Do it when a number would change a choice.

Estimate when:

- the read or write rate decides whether one database is enough;
- storage growth decides whether you need retention or partitioning;
- payload size decides whether bandwidth is a concern;
- a latency or availability target rules out a component.

Skip the full calculation when:

- the interviewer signals that scale is not the focus;
- the design choice is the same at 10x and 10,000x.

You can also estimate later, in context. If you propose a cache, estimate the hit rate and the load on a miss. A number that justifies a decision beats one produced at the start and never used again.

When you do estimate, keep it rough:

```text
100 million redirects/day
86,400 s/day -> about 1,200/s average
peak at 3x -> about 3,600/s
```

State the assumption and show the arithmetic. Order of magnitude is the point.

What this step produces: a number behind a decision, or a reason to skip it.

## Step 3: Core entities

Name the records the system keeps and the fields that matter. This turns features into a data model.

```text
Link
  code         string, unique
  target_url   string
  owner_id     string
  created_at   timestamp
  expires_at   timestamp?

ClickEvent
  code         string
  clicked_at   timestamp
  referrer     string?
```

Keep the first pass small; add fields only when a requirement demands them. The entities expose access patterns: lookup by code, list by owner, count clicks over time. Those patterns justify indexes, partitions, and stores later.

What this step produces: the nouns of the system and their relationships. If an entity has no requirement behind it, remove it.

## Step 4: API or system interface

Write the small set of calls for the core flows. A product interface is usually HTTP. An infrastructure interface may be a library call, a gRPC method, or a queue contract.

```text
POST /links
  body: { target_url, custom_alias?, expires_at? }
  returns: { code, short_url }

GET /:code
  returns: 302 redirect, or 404

GET /links/:code/stats
  returns: { code, clicks, last_clicked_at }

DELETE /links/:code
  returns: 204
```

Include error cases: invalid URL, unknown code, expired link, duplicate alias, unauthorized owner. The interface makes vague requirements testable.

For infrastructure, show inputs, outputs, error codes, limits, and idempotency rules. A rate limiter without a rejection response is not an interface yet.

What this step produces: a contract the rest of the design must satisfy. You can now walk a request through the system.

## Step 5: Data flow, optional

Skip this for a simple design. For a flow with several stages, write the path in words or a short diagram.

```text
create:
  client -> API -> code generator -> database -> cache warm

redirect:
  client -> edge -> API -> cache -> (miss) database -> 302
```

This makes the read and write paths explicit and shows where a queue, cache, or replica belongs. If the path takes more than a few lines, the design is not ready.

What this step produces: a concrete path for the requests that matter.

## Step 6: High-level design

Draw the smallest diagram that covers the core flow. Label each arrow with what it carries.

```text
client
  |
  v
load balancer
  |
  v
API service  --->  cache
  |                  |
  v                  v
primary DB  --->  read replicas
  |
  v
analytics queue ---> worker ---> analytics store
```

Every box needs a job and every arrow a reason. If a component serves no requirement, remove it or mark it as future work.

Start with one service and one database. Split a component out when a requirement forces it: different scaling, different failure behavior, or a clear boundary. Split for a reason you can state, not for realism.

Spaghetti design starts here. Common causes:

- adding every technology you know;
- drawing the final scale design before the basic flow works;
- separating services without a boundary;
- mixing the read path and write path in one unlabeled arrow.

Keep the first diagram boring. Complexity should arrive with a justification.

What this step produces: an end-to-end design a new engineer could follow, showing where data is written, read, and cached.

## Step 7: Deep dives

Pick one or two areas under the most stress. Say why.

Good candidates:

- the hot path, such as redirects or feed reads;
- the write path, such as payments or reservations;
- a consistency boundary, such as seat locking or link creation;
- a failure mode, such as cache loss or queue backlog.

Lead the first deep dive. State the risk, propose a solution, and name the trade-off. Then invite the interviewer in: "The other risk is X. Should we go there, or finish Y first?" That shares control of the deep dive.

When the interviewer probes, follow the question. Do not defend a weak choice. Say what you would change and why. Updating the design often scores better than repeating the original plan.

What this step produces: evidence that the design holds under pressure, not only on the happy path.

## Step 8: Wrap-up and trade-offs

End with a short summary.

- Restate the core flow in one sentence.
- Name the main bottleneck and the trade-off you made.
- Say what you would monitor.
- Say what you would change at 10x scale.

```text
"This design favors fast redirects: cache first, read replicas behind it.
The cost is stale reads for a short window after an edit.
At 10x traffic I would shard by code and move code generation to its own service."
```

A wrap-up is a judgment, not a recap of every box.

What this step produces: a clear position the interviewer can remember.

## When you get stuck

Stuck is normal. Make a small move.

- Return to the requirements. Which one is not satisfied yet?
- Walk one request through the diagram. Where does it slow down or fail?
- Ask for a constraint. "Is the concern scale, consistency, or cost?"
- Draw the simplest version. Remove components until the flow works.
- Say what you do not know. Then propose how you would find out.

The interviewer would rather hear "I am unsure between A and B; here is how I would decide" than silence.

## What to say in an interview

> "I will spend a few minutes on requirements and the constraints that shape the design. I will estimate only if a number changes a choice. Then I will define the entities and interface, sketch the end-to-end flow, and go deep on the riskiest part. I will close with the trade-offs and what I would change at 10x."

That is the framework in one breath. It tells the interviewer where you are going and gives you a path back when the conversation wanders.
