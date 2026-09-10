import type { HomepageLandingCopy } from "../homepage.types";
import { EditableText } from "../editable-text";

export function B2bSection({ copy }: { copy: HomepageLandingCopy["b2b"] }) {
  return (
    <section
      className="bg-surface-muted px-6 py-20"
      data-homepage-section="b2b"
    >
      <div className="mx-auto max-w-4xl space-y-5 text-center">
        <EditableText
          as="p"
          className="uppercase tracking-widest"
          value={{ ...copy.eyebrow, align: "center" }}
        />
        <EditableText
          as="h2"
          className="uppercase"
          value={{ ...copy.title, align: "center" }}
        />
        <EditableText
          as="p"
          className="leading-relaxed"
          value={{ ...copy.description, align: "center" }}
        />
        <EditableText
          as="span"
          className="inline-block rounded-md bg-premium-red px-7 py-4 uppercase !text-white"
          value={copy.partnerCta}
        />
      </div>
    </section>
  );
}
