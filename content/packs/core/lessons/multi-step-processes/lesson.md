# Multi-Step Processes

Some work cannot finish in one request. A payment is authorized now, captured when the order ships, and refunded weeks later. A seat is held while the user pays. A file upload is committed, scanned, and copied to other devices.

Each step can fail on its own. The process must remember where it stopped, retry safely, and decide what to do when a later step cannot finish.

## When a single transaction is enough

If every write lands in one database, the work is short, and no external system is involved, use a transaction. The database gives atomicity and isolation, and the code stays small.

A transaction is a poor fit when:

- a step calls a payment provider or another service;
- a step waits for a human, a shipment, or a scheduled date;
- the work may take minutes, hours, or days;
- different services own different rows.

Holding a database transaction open across a network call ties up locks and connections. A provider timeout can leave the transaction open while the outside world has already changed. Keep the transaction short and make the workflow explicit.

## Partial failure is the normal case

Consider an order with three steps.

```text
order 812
  reserve inventory   done
  charge card         done
  create shipment     failed
```

The customer has been charged and no shipment exists. Retrying the shipment may be enough. If the item is out of stock, the system must release the inventory and refund the charge. That is a business decision, not a database rollback.

Record the state of each step before and after every external call. A row with `status = charging` and a provider reference is more useful than a row that says only `failed`. The outbox pattern helps here: write the state change and the event to publish in one local transaction, then let a relay send the event.

## Orchestration and choreography

There are two ways to connect the steps.

```text
orchestration:
  workflow service -> inventory
                   -> payments
                   -> shipping

choreography:
  order.created -> inventory.reserved -> payment.charged -> shipment.created
```

An orchestrator owns the sequence. It knows which step comes next, sets timeouts, and starts compensations. It is easier to inspect and change. The cost is a central component that must be available and a service that accumulates knowledge of every step.

In choreography, each service reacts to events. Services stay loosely coupled and can be added without changing a central flow. The end-to-end path is harder to see, and a cycle or a missing event can leave the process stuck.

Most large systems mix both. A workflow engine coordinates the critical path, while side effects such as email and analytics consume events.

## Sagas and compensating actions

A saga is a sequence of local transactions. If a later step fails, earlier steps are undone with compensating actions.

```text
reserve inventory -> authorize card -> create shipment
        |                 |                  |
   release stock      void or refund      cancel shipment
```

A compensation is not a rollback. The original effect may already be visible. A refund is a new transaction, not the removal of the old charge. An email cannot be unsent. Order steps so that irreversible actions happen late, or ask for confirmation before the point of no return.

Compensations need the same care as forward steps: an idempotency key, retries, and a state that records whether the compensation completed. A compensation that fails forever needs an alert and a manual queue.

## Durable execution

A durable execution engine, such as Temporal, Amazon Step Functions, or a comparable cloud workflow service, stores the workflow state and step results. The code can look like a normal function, but the engine checkpoints each step. If the process crashes, the workflow resumes on another worker.

```text
worker: run step 1 -> checkpoint
worker: run step 2 -> crash
engine: start worker -> resume at step 2
```

This removes a large amount of hand-written state management. It also adds a dependency, a new operational model, and rules about deterministic code and workflow versioning. Use it when workflows are long, numerous, and important. A single queue task does not need it.

## Event sourcing and replay

Event sourcing stores every change as an append-only event. Current state is a projection built by replaying those events.

```text
events:  payment.authorized
         payment.captured
         payment.refunded

state:   payment 812 is refunded
```

The log is an audit trail and can rebuild read models after a bug. The costs are event schema changes, storage growth, and eventual consistency between the log and its projections. Event sourcing is a persistence choice. A saga is a coordination choice. They can be used together, but neither requires the other.

## Idempotent steps

Every step should be safe to run twice. Use a key built from the workflow ID and the step name, then store the result.

```text
step key = "order-812:charge"
if key exists: return stored result
else: call provider, store result, mark done
```

The uniqueness check must be atomic. A database unique constraint on `(workflow_id, step_name)` works. For an external provider, pass its own idempotency key so a retry does not create a second charge.

## Timeouts, retries, and the exactly-once illusion

Each step needs a timeout, a retry policy with backoff and jitter, and a maximum attempt count. After the last attempt, move the workflow to a state that a person can inspect.

Exactly-once delivery across independent systems is an illusion. A provider can commit a charge and then time out before replying. The safe model is at-least-once calls plus idempotent handlers and a way to query the provider for the result.

## Audit trails

Keep an append-only record of state transitions: workflow ID, step, old state, new state, timestamp, request ID, and provider reference. The current status row is for fast reads. The audit trail is for disputes, debugging, and reconciliation.

## Worked example: authorize, capture, refund

```text
pending -> authorized -> captured -> refunded
   |           |            |
   +-> failed  +-> voided   +-> refund_pending
```

1. The client posts a payment with an idempotency key. The API writes a `pending` row and starts a workflow.
2. The workflow authorizes the card with key `pay-812:authorize`. It stores the provider reference and moves to `authorized`.
3. When the order ships, the workflow captures with key `pay-812:capture`. Capture writes ledger entries and moves to `captured`.
4. A refund starts a new workflow with key `refund-901`. It moves to `refund_pending`, calls the provider, and only marks `refunded` after confirmation.

If authorization times out, the workflow queries the provider by its key before trying again. If capture fails permanently, it voids the authorization or sends the case to review. If the service crashes, the engine resumes from the last checkpoint.

## Failure modes

- A crash between an external call and the database write can duplicate an effect. Use an idempotency key and a reconciliation query.
- A workflow can wait forever on a timer or event. Alert on age, not only on errors.
- A compensation can fail. Keep it retryable and visible.
- A new workflow version can break runs that are already in flight. Version the workflow definition and keep old paths available.

## Trade-offs

- A single transaction is simplest, but it only covers one database and a short duration.
- An orchestrator is visible and controllable, but it adds central coupling.
- Choreography is loosely coupled, but the full path is harder to trace.
- Event sourcing gives a strong audit trail and replay, but event evolution is hard.
- A durable engine removes custom code, but it adds a dependency the team must operate.

## What to say in an interview

> "A payment is a multi-step workflow, not one transaction. The API records a pending payment and starts a durable workflow. Each step has an idempotency key and a stored result. Authorization, capture, and refund are separate local transactions with provider references. A failed capture triggers a void or a refund, and a failed step goes to a manual queue after bounded retries. We keep an append-only audit log and alert on workflows that stay in one state for too long."

That names the boundary, the failure strategy, and the proof that the system can recover.
