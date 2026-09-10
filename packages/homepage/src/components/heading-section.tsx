import type { WebsiteEditableText } from "@repo/shared";
import { EditableText } from "../editable-text";

export function HeadingSection({
  description,
  eyebrow,
  id,
  title,
  muted = false,
}: {
  description?: WebsiteEditableText;
  eyebrow: WebsiteEditableText;
  id: string;
  title: WebsiteEditableText;
  muted?: boolean;
}) {
  return (
    <section
      className={`${muted ? "bg-surface-muted" : "bg-white"} px-6 py-20 lg:px-20`}
      data-homepage-section={id}
    >
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        <EditableText
          as="p"
          className="uppercase tracking-widest"
          value={{ ...eyebrow, align: "center" }}
        />
        <EditableText
          as="h2"
          className="uppercase"
          value={{ ...title, align: "center" }}
        />
        {description ? (
          <EditableText
            as="p"
            className="leading-relaxed"
            value={{ ...description, align: "center" }}
          />
        ) : null}
      </div>
    </section>
  );
}
