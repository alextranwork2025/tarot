"use client";

import { Archive, Eye, FilePenLine, Send, Trash2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
  archiveService,
  deleteService,
  publishService,
  unpublishService,
  type ServiceActionState,
} from "@/lib/actions/services";
import type { ServiceStatus } from "@/types/database.types";

const emptyState: ServiceActionState = { ok: false, message: "" };

type Props = {
  service: {
    id: string;
    slug: string;
    status: ServiceStatus;
    updated_at: string | null;
  };
  compact?: boolean;
};

export function AdminServiceActions({ service, compact = false }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<ServiceActionState>(emptyState);

  function runAction(action: (previous: ServiceActionState, formData: FormData) => Promise<ServiceActionState>) {
    const formData = new FormData();
    formData.set("id", service.id);
    formData.set("expectedUpdatedAt", service.updated_at ?? "");
    startTransition(async () => {
      setMessage(await action(emptyState, formData));
    });
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Link title="Xem" href={`/admin/dich-vu/${service.id}`} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold">
          <Eye size={16} />
        </Link>
        <Link title="Chỉnh sửa" href={`/admin/dich-vu/${service.id}/chinh-sua`} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold">
          <FilePenLine size={16} />
        </Link>
        {service.status !== "published" ? (
          <button disabled={pending} title="Xuất bản" onClick={() => runAction(publishService)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold disabled:opacity-60">
            <Send size={16} />
          </button>
        ) : (
          <button disabled={pending} title="Chuyển về bản nháp" onClick={() => runAction(unpublishService)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold disabled:opacity-60">
            <Undo2 size={16} />
          </button>
        )}
        {service.status !== "archived" ? (
          <button disabled={pending} title="Lưu trữ" onClick={() => runAction(archiveService)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold disabled:opacity-60">
            <Archive size={16} />
          </button>
        ) : null}
        <button
          disabled={pending}
          title="Xóa mềm"
          onClick={() => {
            if (window.confirm("Xóa mềm dịch vụ này?")) {
              runAction(deleteService);
            }
          }}
          className="grid size-9 place-items-center rounded-sm border border-wine/70 text-red-100 hover:bg-wine disabled:opacity-60"
        >
          <Trash2 size={16} />
        </button>
        {!compact && service.status === "published" ? (
          <Link href={`/dich-vu/${service.slug}`} className="inline-flex min-h-9 items-center rounded-full border border-gilded/50 px-3 text-xs text-stone-mist hover:border-antique-gold hover:text-antique-gold">
            Trang công khai
          </Link>
        ) : null}
      </div>
      {message.message ? <p role="status" className={message.ok ? "text-antique-gold" : "text-red-200"}>{message.message}</p> : null}
    </div>
  );
}
