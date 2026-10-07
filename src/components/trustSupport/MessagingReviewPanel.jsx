import React, { useEffect, useState } from "react";
import Card from "../shared/Card.jsx";
import { FiMessageSquare } from "react-icons/fi";
import { formatDate } from "../../utils/formatters.js";
import * as svc from "../../services/trustSupport.service.js";

/**
 * The conversation between the two parties to a dispute.
 *
 * This panel said "No messages" for every dispute ever opened, because the service hardcoded
 * `messages: []`. A dispute has no messages of its own — but the reporter and the person reported
 * have a chat, and that thread is the record anyone adjudicating actually needs to read. It is
 * fetched now.
 *
 * Read-only, and it says so. The panel was titled "Moderate messages inside the dispute", but
 * deleting a participant's message is a different power from reading the thread, the chat service
 * does not permit a third party to do it, and an adjudicator editing the evidence they are weighing
 * is not a feature worth inventing. Both hide/show handlers returned fabricated objects without
 * calling anything.
 */
export default function MessagingReviewPanel({ dispute, currentUserIds }) {
  // Starts in the state the first render should show, so nothing is set synchronously from the
  // effect. The parent keys this component on the dispute, so opening a different one remounts it
  // and this initial state applies again.
  const [state, setState] = useState(() => ({
    loading: Boolean(dispute?.id),
    error: "",
    data: null,
  }));

  useEffect(() => {
    if (!dispute?.id) return;
    let alive = true;
    svc
      .getDisputeMessages(dispute.id)
      .then((data) => alive && setState({ loading: false, error: "", data }))
      .catch(
        (e) =>
          alive &&
          setState({
            loading: false,
            // Shown rather than swallowed: an empty thread and a failed request look identical
            // otherwise, which is how this panel managed to look fine while being empty always.
            error: e?.message || "Could not load the conversation.",
            data: null,
          }),
      );
    return () => {
      alive = false;
    };
  }, [dispute?.id]);

  const messages = state.data?.messages || [];
  const reporterId = currentUserIds?.reportedBy || state.data?.participants?.reportedBy;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            Conversation
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            What the two parties said to each other. Read-only.
          </p>
        </div>
        <div className="rounded-2xl bg-brand-soft p-2 text-brand">
          <FiMessageSquare className="h-5 w-5" />
        </div>
      </div>

      {state.error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {state.loading ? (
          <p className="text-sm text-neutral-500">Loading conversation...</p>
        ) : null}

        {!state.loading && !state.error && messages.length === 0 ? (
          <p className="text-sm text-neutral-500">
            {state.data?.conversationId
              ? "The conversation exists but has no messages."
              : "These two have never messaged each other."}
          </p>
        ) : null}

        {messages.map((m) => {
          const fromReporter = m.senderId && m.senderId === reporterId;
          return (
            <div
              key={m.id}
              className={
                "rounded-2xl border p-3 " +
                (fromReporter ? "bg-white" : "bg-neutral-50")
              }
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {m.author}
                  {fromReporter ? (
                    <span className="ml-2 text-xs font-normal text-neutral-500">
                      reporter
                    </span>
                  ) : null}
                </p>
                <p className="shrink-0 text-xs text-neutral-500">
                  {formatDate(m.createdAt)}
                </p>
              </div>

              {m.imageUrl ? (
                <a
                  href={m.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block overflow-hidden rounded-xl border"
                >
                  <img
                    src={m.imageUrl}
                    alt={m.text || "Attachment"}
                    loading="lazy"
                    className="max-h-56 w-full bg-neutral-100 object-contain"
                  />
                </a>
              ) : null}

              {m.text ? (
                <p className="mt-1 whitespace-pre-line text-sm text-neutral-700">
                  {m.text}
                </p>
              ) : null}
            </div>
          );
        })}

        {state.data?.truncated ? (
          <p className="text-xs text-neutral-500">
            Showing the first 100 messages.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
