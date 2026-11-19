"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { editorialCtaSecondary, editorialPanel } from "@/components/ui/editorial-primitives";

type Note = { id: string; body: string; createdAt: string };
type FileRow = { id: string; fileName: string | null; mimeType: string | null; url: string; createdAt: string };

export default function MemberChartPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      fetch("/api/member/chart/notes").then(async (res) => {
        if (!res.ok) throw new Error("Could not load chart notes.");
        return (await res.json()) as { notes: Note[] };
      }),
      fetch("/api/member/chart/files").then(async (res) => {
        if (!res.ok) throw new Error("Could not load chart files.");
        return (await res.json()) as { files: FileRow[] };
      }),
    ])
      .then(([notesPayload, filesPayload]) => {
        setNotes(notesPayload.notes);
        setFiles(filesPayload.files);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-[#1f1a15]">Your care notes</h1>
          <p className="mt-1 text-sm text-[#6f6251]">Notes and files your clinician shared with you.</p>
        </div>
        <Link href="/dashboard" className={editorialCtaSecondary}>
          Back to dashboard
        </Link>
      </div>
      {error ? <p className="text-sm text-[#7c2c2c]">{error}</p> : null}

      <section className={`${editorialPanel} space-y-3 p-5`}>
        <h2 className="font-serif text-2xl text-[#1f1a15]">Shared notes</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-[#6f6251]">No shared notes yet.</p>
        ) : (
          notes.map((note) => (
            <article key={note.id} className="rounded-sm border border-[#eadfcd] bg-white/70 p-3 text-sm">
              <p className="whitespace-pre-wrap text-[#3b3024]">{note.body}</p>
              <p className="mt-2 text-[11px] text-[#8f6f3e]">{new Date(note.createdAt).toLocaleString()}</p>
            </article>
          ))
        )}
      </section>

      <section className={`${editorialPanel} space-y-3 p-5`}>
        <h2 className="font-serif text-2xl text-[#1f1a15]">Shared files</h2>
        {files.length === 0 ? (
          <p className="text-sm text-[#6f6251]">No shared files yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {files.map((file) => (
              <figure key={file.id} className="overflow-hidden rounded-sm border border-[#eadfcd] bg-white">
                {file.mimeType?.startsWith("image") || file.url.startsWith("data:image") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={file.url} alt={file.fileName || "Shared file"} className="h-40 w-full object-contain bg-[#f7f1e6]" />
                ) : (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-40 items-center justify-center text-sm text-[#8f6f3e] underline"
                  >
                    Open {file.fileName || "file"}
                  </a>
                )}
                <figcaption className="p-2 text-xs text-[#6f6251]">{file.fileName || "Untitled"}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
