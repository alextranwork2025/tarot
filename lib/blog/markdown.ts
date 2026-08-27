const dangerousProtocolPattern = /^\s*(javascript|data|vbscript):/i;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeBlogMarkdown(input: string) {
  return input
    .replace(/<\s*\/?\s*(script|iframe|object|embed|link|meta|style)[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]*/gi, "")
    .replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, "$1=\"#\"")
    .replace(/\]\(\s*javascript:[^)]+\)/gi, "](#)")
    .trim();
}

function renderInline(input: string) {
  let value = escapeHtml(input);
  value = value.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt: string, url: string) => {
    const safeUrl = dangerousProtocolPattern.test(url) ? "#" : escapeHtml(url.trim());
    return `<img src="${safeUrl}" alt="${escapeHtml(alt)}" loading="lazy" />`;
  });
  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, url: string) => {
    const safeUrl = dangerousProtocolPattern.test(url) ? "#" : escapeHtml(url.trim());
    return `<a href="${safeUrl}" rel="noopener noreferrer nofollow">${escapeHtml(label)}</a>`;
  });
  value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  value = value.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return value;
}

export function renderBlogMarkdown(markdown: string) {
  const lines = sanitizeBlogMarkdown(markdown).split(/\r?\n/);
  const html: string[] = [];
  let listOpen = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      const level = heading[1].length + 1;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${renderInline(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }

    if (trimmed.startsWith("> ")) {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      html.push(`<blockquote>${renderInline(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
    html.push(`<p>${renderInline(trimmed)}</p>`);
  }

  if (listOpen) {
    html.push("</ul>");
  }

  return html.join("\n");
}
