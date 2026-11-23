---
title: "RAG in Production: What the Demos Don't Tell You"
description: "Chunking, reranking, evaluation and hallucination guards — the unglamorous engineering decisions that decide whether a RAG pipeline helps users or quietly misleads them."
date: "2026-03-15"
tags: ["AI", "RAG", "Laravel"]
---

A retrieval-augmented generation pipeline is easy to prototype and hard to trust. The demo answer sounds confident and relevant. The production answer, two months later, confidently cites the wrong paragraph, misses the page it should have found, and gradually stops mentioning the documents that were added last week.

Most RAG failures are not model failures. They are pipeline decisions that looked fine in testing.

## Retrieval quality decides everything downstream

If retrieval misses, generation cannot recover — no amount of prompt engineering fixes a document the model never saw. Two investments pay off disproportionately:

**1. Chunk with structure, not character counts.** A naive 500-character splitter cuts sentences in half and separates headings from their content. Respect document structure first:

```php
// Laravel service: split on headings, then keep paragraphs intact
$chunks = collect($sections)->flatMap(function ($section) {
    $paragraphs = preg_split('/\n{2,}/', $section['body']);
    return array_map(fn ($p) => [
        'text' => $section['heading'] . "\n\n" . $p,
        'source' => $section['source'],
    ], $paragraphs);
});
```

**2. Rerank the retrieved set.** Fetch more candidates than you need (say 20), then rerank with a cross-encoder or a small dedicated model. The top-5 after reranking is dramatically more precise than the top-5 from raw vector search.

## Citations are a product feature, not decoration

Every claim the system makes should trace to a source the user can verify. Require the model to emit structured citations and render them as clickable links to the exact chunk:

```json
{
  "answer": "Oxygen LMS handles attendance and reporting today.",
  "citations": [{"chunk_id": "doc:oxygen#attendance", "quote": "attendance, reporting and user management"}]
}
```

This does three things at once: it builds user trust, it makes wrong answers debuggable, and it gives you labeled data — every time a user clicks a citation, you learn whether retrieval was right.

## Build the evaluation set before you need it

The single most underrated step. Gather 30–50 real questions with known-correct answers — questions your support team actually receives. Then measure three things for every run:

- **Retrieval recall** — did the correct document appear in the top-k?
- **Answer correctness** — does the answer match the known-good one?
- **Hallucination rate** — did the model assert anything not grounded in the retrieved context?

Run this suite on every change to chunking, embeddings, the prompt or the model. A chunking strategy that scores 92% recall in the suite is not guaranteed in production — but a strategy that scores 60% will absolutely fail in production.

## Guard the edges

The dangerous cases are not the ordinary questions. They are:

- **Questions outside your corpus** — the model should say so, not improvise. Detect topic drift and return a candid "I don't have that" with a route to a human.
- **Conflicting documents** — when sources disagree, surface both rather than averaging them into a confident lie.
- **Stale data** — when documents change, refresh embeddings and keep timestamps visible in citations. A correct answer from an outdated document is still wrong.

## Keep the pipeline observable

Log every request with the query, the retrieved chunk IDs, the rerank scores, the final answer and the citations. When a user reports a bad answer, you want to replay that exact request — query, context and prompt — not reconstruct it from memory.

The teams that win with RAG treat it like any other production system: staged rollouts, telemetry, evals, and a pipeline that can be rebuilt end to end. The magic is not in the retrieval. It is in the discipline around it.
