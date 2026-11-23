---
title: "Designing Agentic Systems That Actually Ship"
description: "Patterns for building AI agent systems that survive contact with real users: orchestration, tool use, failure handling and the evaluation loops most demos skip."
date: "2026-06-02"
tags: ["AI", "Agents", "RAG"]
---

Every agent demo looks flawless in a slide deck. The same system in production meets messy data, slow networks, ambiguous instructions and users who type things no one predicted. The difference between a demo and a product is almost never the model — it is the scaffolding around it.

Here is the set of patterns I keep returning to when building agentic systems that need to ship.

## Start with the orchestrator, not the model

The most common mistake is letting the model direct itself with no structural constraints. Give the system an explicit orchestrator layer that owns three decisions:

- **What runs next** — a deterministic state machine or task graph, not free-form generation
- **What tools are available** — a narrow, auditable tool registry per task
- **When to stop** — clear completion criteria, including the right to answer "I don't know"

```python
# A minimal orchestrator loop: deterministic state, model fills the gaps
state = "collect_requirement"
for step in range(MAX_STEPS):
    action = planner(state, context, tools)
    if action.type == "complete":
        break
    result = run_tool(action.tool, action.args, context)
    context.append(Observation(action, result))
    state = next_state(state, action)
```

The model should decide *within* the frame. It should not decide *the frame*.

## Make tool calls boring and observable

Tools are where agents get into trouble. Every tool call should be logged with its arguments, result and duration. When a production agent misbehaves, you replay the trace — not guess at it.

Design tools to fail safely:

1. **Validate arguments** before executing anything destructive.
2. **Enforce timeouts** — a hung tool call should never block the whole agent.
3. **Return structured errors** the model can act on, not raw exceptions.
4. **Rate-limit and budget** expensive tools per session and per user.

## Design for partial failure

Agents will hit bad data, rate limits and outages. A shipping-grade system degrades gracefully:

- Retry with backoff for transient failures, and mark the retry count.
- Fall back to a simpler path — a retrieval answer without regeneration, or a cached response.
- Escalate to a human when confidence drops below a threshold, and hand over the full context.

The human-in-the-loop loop is not a fallback for laziness. For high-stakes actions — sending emails, moving money, mutating records — it is the correct default. Capture the human's decision as a label and feed it back into the system's memory of what works.

## Evaluation is the real product work

Before an agent reaches users, build three evaluations:

- **Golden set** — representative tasks with known-good outcomes
- **Adversarial set** — the requests that break naive implementations
- **Regression set** — every bug reported in production, forever

```bash
# The regression set is the most valuable one
python evals/run.py --suite regression --baseline latest
```

Every model upgrade, prompt change and tool change runs the suite before it ships. The prompt that scores well on the golden set but fails the regression set is the prompt that generates your worst support ticket.

## Measure what users actually experience

Instrument the journey, not just the model. Track:

- Steps taken per task (rising steps mean the agent is wandering)
- Tool failure rate and retry counts
- User edits to agent output (the strongest signal the output was wrong)
- Escalations and their resolution times

These metrics will tell you the truth about your agent faster than any benchmark. A model score says the system *can* work; user-edit rate says whether it *does*.

## Keep the loop tight

The teams that ship good agents are the ones that treat evaluation, telemetry and user feedback as first-class parts of the product — not a post-launch cleanup. Build the loop first, then the agent. The agent gets easier; the loop never does.
