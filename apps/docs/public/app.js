const moduleNav = document.querySelector("#module-nav");
const docTitle = document.querySelector("#doc-title");
const docDescription = document.querySelector("#doc-description");
const docContent = document.querySelector("#doc-content");

let modules = [];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderInline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inCode = false;
  let codeLines = [];
  let inList = false;

  function closeList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        html.push(
          `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
        );
        codeLines = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      const text = renderInline(heading[2]);
      html.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^-\s+(.+)$/);
    if (listItem) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${renderInline(listItem[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${renderInline(line)}</p>`);
  }

  closeList();
  return html.join("");
}

function getActiveModule() {
  const hash = window.location.hash.replace("#", "");
  return modules.find((moduleItem) => moduleItem.id === hash) || modules[0];
}

function renderNav(activeId) {
  moduleNav.innerHTML = modules
    .map((moduleItem) => {
      const isActive = moduleItem.id === activeId;
      const linkClass = isActive
        ? "border-blue-200 bg-blue-50 text-accent shadow-sm shadow-blue-100/70"
        : "border-line/70 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50 hover:text-ink hover:shadow-sm";
      const markerClass = isActive
        ? "bg-accent"
        : "bg-slate-300 group-hover:bg-accent";
      const descriptionClass = isActive
        ? "text-blue-700"
        : "text-muted group-hover:text-slate-600";

      return `
        <a
          class="${linkClass} group relative inline-flex min-h-12 shrink-0 items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 lg:flex lg:w-full"
          href="#${moduleItem.id}"
          data-module-id="${moduleItem.id}"
          aria-current="${isActive ? "page" : "false"}"
        >
          <span class="${markerClass} hidden h-8 w-1 rounded-full transition lg:block"></span>
          <span class="min-w-0">
            <span class="block font-semibold">${moduleItem.title}</span>
            <span class="${descriptionClass} mt-1 hidden text-xs leading-5 lg:block">${moduleItem.description}</span>
          </span>
        </a>
      `;
    })
    .join("");
}

async function loadActiveModule() {
  const activeModule = getActiveModule();

  if (!activeModule) {
    return;
  }

  renderNav(activeModule.id);
  docTitle.textContent = activeModule.title;
  docDescription.textContent = activeModule.description;
  docContent.innerHTML =
    '<div class="rounded-md border border-line bg-panel p-5 text-muted">Đang tải...</div>';

  try {
    const response = await fetch(`/content/${activeModule.file}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${activeModule.file}`);
    }

    const markdown = await response.text();
    docContent.innerHTML = renderMarkdown(markdown);
  } catch {
    docContent.innerHTML = document.querySelector("#error-template").innerHTML;
  }
}

async function boot() {
  const response = await fetch("/content/modules.json", { cache: "no-store" });
  modules = await response.json();

  if (!window.location.hash && modules[0]) {
    window.history.replaceState(null, "", `#${modules[0].id}`);
  }

  await loadActiveModule();
}

window.addEventListener("hashchange", loadActiveModule);
void boot();
