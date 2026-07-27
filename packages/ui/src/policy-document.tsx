import { FileText } from "lucide-react";
import { cn } from "./lib/utils";

export type PolicyDocumentProps = {
  className?: string;
  content?: string | null;
  emptyDescription: string;
  emptyTitle: string;
  eyebrow: string;
  summary?: string | null;
  title: string;
  updatedText?: string | null;
};

export function PolicyDocument({
  className,
  content,
  emptyDescription,
  emptyTitle,
  eyebrow,
  summary,
  title,
  updatedText,
}: PolicyDocumentProps) {
  return (
    <article className={cn("bg-white text-slate-950", className)}>
      <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <header className="border-b border-slate-200 pb-8 sm:pb-10">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-9 shrink-0 bg-red-600" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-700">
              {eyebrow}
            </p>
          </div>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-[-0.025em] text-slate-950 sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {updatedText ? (
            <p className="mt-5 text-sm font-medium text-slate-500">
              {updatedText}
            </p>
          ) : null}
          {summary ? (
            <p className="mt-6 max-w-3xl border-l-2 border-red-600 pl-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              {summary}
            </p>
          ) : null}
        </header>

        {content?.trim() ? (
          <div
            className="pt-8 text-base leading-8 text-slate-700 sm:pt-10 sm:text-[1.0625rem] [&_a]:font-medium [&_a]:text-red-700 [&_a]:underline [&_a]:decoration-red-200 [&_a]:underline-offset-4 hover:[&_a]:decoration-red-700 [&_blockquote]:my-7 [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-5 [&_blockquote]:italic [&_h1]:mt-10 [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-slate-950 [&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-950 [&_hr]:my-8 [&_hr]:border-slate-200 [&_li]:pl-1 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:my-4 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:p-3 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-3 [&_th]:text-left [&_ul]:my-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div
            className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center sm:mt-10 sm:px-10"
            role="status"
          >
            <FileText
              aria-hidden="true"
              className="mx-auto size-9 text-slate-400"
            />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              {emptyTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {emptyDescription}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
