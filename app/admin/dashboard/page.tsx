"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContactMessage, ContactStatus } from "@/lib/contact-storage";

type FilterMode = "inbox" | "all" | "archived";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function initials(value: string) {
  return value.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "?";
}

export default function AdminDashboardPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState<FilterMode>("inbox");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadMessages = useCallback(async () => {
    setLoadError("");
    try {
      const response = await fetch("/api/admin/messages", { cache: "no-store" });
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      const result = await response.json() as { messages?: ContactMessage[]; error?: string };
      if (!response.ok || !result.messages) {
        setLoadError(result.error || "The inbox couldn't be loaded.");
        return;
      }
      setMessages(result.messages);
      setSelectedId((current) => current && result.messages?.some((message) => message.id === current)
        ? current
        : result.messages?.[0]?.id || "");
    } catch {
      setLoadError("We couldn't connect to the inbox. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const unreadCount = messages.filter((message) => message.status === "new").length;
  const archivedCount = messages.filter((message) => message.status === "archived").length;

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    return messages.filter((message) => {
      const matchesFilter = filter === "all" ||
        (filter === "inbox" && message.status !== "archived") ||
        (filter === "archived" && message.status === "archived");
      const matchesSearch = !query ||
        [message.name, message.email, message.company || "", message.project_type || "", message.message]
          .some((value) => value.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [messages, filter, search]);

  const activeMessage = filteredMessages.find((message) => message.id === selectedId) || filteredMessages[0];

  async function changeStatus(message: ContactMessage, status: ContactStatus) {
    setUpdatingId(message.id);
    setLoadError("");
    try {
      const response = await fetch("/api/admin/messages/" + message.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        setLoadError(result.error || "The message could not be updated.");
        return;
      }
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, status } : item));
    } catch {
      setLoadError("We couldn't update that message. Please try again.");
    } finally {
      setUpdatingId("");
    }
  }

  async function signOut() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.assign("/admin/login");
    }
  }

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <a className="admin-brand admin-sidebar-brand" href="/" aria-label="AppverseSI home">
          <span className="admin-brand-mark">A</span>
          <span>APPVERSE<span className="admin-brand-dot">.</span>SI <small>ADMIN</small></span>
        </a>
        <div className="admin-nav-caption">WORKSPACE</div>
        <button className="admin-nav-item active" type="button">
          <span className="admin-nav-icon">▤</span> Enquiries
          <span className="admin-nav-count">{unreadCount}</span>
        </button>
        <div className="admin-sidebar-bottom">
          <div className="admin-connection"><span className="admin-status-dot" /><span><b>Private inbox</b><small>Session secured</small></span></div>
          <button className="admin-logout-button" type="button" onClick={signOut}>Sign out <span aria-hidden="true">↗</span></button>
          <a className="admin-back-link" href="https://appverse.si" target="_blank" rel="noreferrer">Visit AppverseSI ↗</a>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">APPVERSESI <span>/</span> INBOX</div>
          <div className="admin-topbar-right"><span className="admin-live-indicator" /> PRIVATE ADMIN <span className="admin-avatar">A</span></div>
        </header>

        <div className="admin-content">
          <div className="admin-page-heading">
            <div>
              <p className="admin-eyebrow">BUSINESS ENQUIRIES / OVERVIEW</p>
              <h1>Your inbox<span>.</span></h1>
              <p>Every project message submitted through appverse.si, in one place.</p>
            </div>
            <button className="admin-refresh-button" type="button" onClick={() => void loadMessages()} disabled={loading}>
              <span aria-hidden="true">↻</span> Refresh
            </button>
          </div>

          <div className="admin-stat-grid">
            <article className="admin-stat-card"><span>ALL MESSAGES</span><strong>{messages.length}</strong><small>Latest 200 enquiries</small></article>
            <article className="admin-stat-card admin-stat-highlight"><span>UNREAD</span><strong>{unreadCount}</strong><small>Waiting for your review</small></article>
            <article className="admin-stat-card"><span>ARCHIVED</span><strong>{archivedCount}</strong><small>Filed away for later</small></article>
          </div>

          {loadError ? <div className="admin-alert" role="alert">{loadError}</div> : null}

          <div className="admin-inbox-toolbar">
            <div className="admin-filter-tabs" role="tablist" aria-label="Filter messages">
              <button type="button" className={filter === "inbox" ? "selected" : ""} onClick={() => setFilter("inbox")}>Inbox <span>{messages.filter((m) => m.status !== "archived").length}</span></button>
              <button type="button" className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>All</button>
              <button type="button" className={filter === "archived" ? "selected" : ""} onClick={() => setFilter("archived")}>Archived</button>
            </div>
            <label className="admin-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search enquiries…" aria-label="Search enquiries" /></label>
          </div>

          <div className="admin-inbox-grid">
            <section className="admin-message-list" aria-label="Messages">
              {loading ? <div className="admin-empty-state"><span className="admin-loader" />Loading your inbox…</div> :
                filteredMessages.length === 0 ? <div className="admin-empty-state"><span className="admin-empty-symbol">↳</span><strong>{search ? "No matching messages" : "Nothing here yet"}</strong><p>{search ? "Try another name, email, or keyword." : "New project enquiries will appear here when someone submits the website form."}</p></div> :
                  filteredMessages.map((message) => (
                    <button
                      className={"admin-message-row" + (activeMessage?.id === message.id ? " selected" : "")}
                      key={message.id}
                      type="button"
                      onClick={() => setSelectedId(message.id)}
                    >
                      <span className={"admin-message-avatar" + (message.status === "new" ? " unread" : "")}>{initials(message.name)}</span>
                      <span className="admin-message-summary">
                        <span className="admin-message-row-top"><strong>{message.name}</strong><time>{formatDate(message.created_at)}</time></span>
                        <span className="admin-message-subject">{message.project_type || "Project enquiry"}</span>
                        <span className="admin-message-preview">{message.message}</span>
                        <span className="admin-message-row-bottom"><span>{message.status === "new" ? "● NEW" : message.status.toUpperCase()}</span>{message.company ? <span>{message.company}</span> : null}</span>
                      </span>
                    </button>
                  ))
              }
            </section>

            <section className="admin-message-detail" aria-label="Selected message">
              {!activeMessage ? <div className="admin-detail-empty"><div>↗</div><strong>Select an enquiry</strong><p>Choose a message from the inbox to read the full brief.</p></div> : (
                <>
                  <div className="admin-detail-topline"><span>ENQUIRY DETAIL</span><span className={"admin-status-tag status-" + activeMessage.status}>{activeMessage.status.toUpperCase()}</span></div>
                  <div className="admin-detail-sender">
                    <span className="admin-message-avatar admin-message-avatar-large">{initials(activeMessage.name)}</span>
                    <div><h2>{activeMessage.name}</h2><p>{activeMessage.company || "Independent enquiry"}</p></div>
                    <time>{formatDate(activeMessage.created_at)}</time>
                  </div>
                  <div className="admin-detail-contact">
                    <div><span>EMAIL ADDRESS</span><a href={"mailto:" + activeMessage.email}>{activeMessage.email}</a></div>
                    <div><span>PROJECT TYPE</span><strong>{activeMessage.project_type || "Not specified"}</strong></div>
                  </div>
                  <div className="admin-detail-message"><div className="admin-detail-message-label">PROJECT BRIEF</div><p>{activeMessage.message}</p></div>
                  <div className="admin-detail-actions">
                    <a className="admin-primary-button admin-reply-button" href={"mailto:" + activeMessage.email + "?subject=" + encodeURIComponent("Re: Your AppverseSI project enquiry")}>Reply by email <span aria-hidden="true">↗</span></a>
                    {activeMessage.status === "archived" ? (
                      <button type="button" className="admin-secondary-button" disabled={updatingId === activeMessage.id} onClick={() => void changeStatus(activeMessage, "read")}>Restore to inbox</button>
                    ) : activeMessage.status === "new" ? (
                      <button type="button" className="admin-secondary-button" disabled={updatingId === activeMessage.id} onClick={() => void changeStatus(activeMessage, "read")}>Mark as read</button>
                    ) : (
                      <button type="button" className="admin-secondary-button" disabled={updatingId === activeMessage.id} onClick={() => void changeStatus(activeMessage, "new")}>Mark unread</button>
                    )}
                    {activeMessage.status !== "archived" ? (
                      <button type="button" className="admin-text-button" disabled={updatingId === activeMessage.id} onClick={() => void changeStatus(activeMessage, "archived")}>Archive enquiry</button>
                    ) : null}
                  </div>
                </>
              )}
            </section>
          </div>
          <footer className="admin-footer"><span>APPVERSESI ADMIN / PRIVATE</span><span>INBOX DATA STORED SECURELY</span></footer>
        </div>
      </section>
    </main>
  );
}
