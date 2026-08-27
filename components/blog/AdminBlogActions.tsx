"use client";

import { Archive, Eye, FilePenLine, Send, Trash2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
  archiveBlogPost,
  deleteBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  type BlogActionState,
} from "@/lib/actions/blog";
import type { BlogPostStatus } from "@/types/blog";

const emptyState: BlogActionState = { ok: false, message: "" };

type Props = {
  post: {
    id: string;
    slug: string;
    status: BlogPostStatus;
    updated_at: string;
  };
  compact?: boolean;
};

export function AdminBlogActions({ post, compact = false }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<BlogActionState>(emptyState);

  function runAction(action: (previous: BlogActionState, formData: FormData) => Promise<BlogActionState>) {
    const formData = new FormData();
    formData.set("id", post.id);
    formData.set("expectedUpdatedAt", post.updated_at);
    startTransition(async () => {
      setMessage(await action(emptyState, formData));
    });
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Link title="Xem" href={`/admin/bai-viet/${post.id}`} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold">
          <Eye size={16} />
        </Link>
        <Link title="Chỉnh sửa" href={`/admin/bai-viet/${post.id}/chinh-sua`} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold">
          <FilePenLine size={16} />
        </Link>
        {post.status !== "published" ? (
          <button disabled={pending} title="Xuất bản" onClick={() => runAction(publishBlogPost)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold disabled:opacity-60">
            <Send size={16} />
          </button>
        ) : (
          <button disabled={pending} title="Chuyển về bản nháp" onClick={() => runAction(unpublishBlogPost)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold disabled:opacity-60">
            <Undo2 size={16} />
          </button>
        )}
        {post.status !== "archived" ? (
          <button disabled={pending} title="Lưu trữ" onClick={() => runAction(archiveBlogPost)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold disabled:opacity-60">
            <Archive size={16} />
          </button>
        ) : null}
        <button
          disabled={pending}
          title="Xóa mềm"
          onClick={() => {
            if (window.confirm("Xóa mềm bài viết này?")) {
              runAction(deleteBlogPost);
            }
          }}
          className="grid size-9 place-items-center rounded-sm border border-wine/70 text-red-100 hover:bg-wine disabled:opacity-60"
        >
          <Trash2 size={16} />
        </button>
        {!compact && post.status === "published" ? (
          <Link href={`/blog/${post.slug}`} className="inline-flex min-h-9 items-center rounded-full border border-gilded/50 px-3 text-xs text-stone-mist hover:border-antique-gold hover:text-antique-gold">
            Trang công khai
          </Link>
        ) : null}
      </div>
      {message.message ? <p role="status" className={message.ok ? "text-antique-gold" : "text-red-200"}>{message.message}</p> : null}
    </div>
  );
}
