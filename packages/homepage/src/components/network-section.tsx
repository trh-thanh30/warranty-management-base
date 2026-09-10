import type { ReactNode } from "react";
import type { HomepageLandingCopy } from "../homepage.types";
import { EditableText } from "../editable-text";

export function NetworkSection({
  copy,
  networkContent,
}: {
  copy: HomepageLandingCopy["network"];
  networkContent?: ReactNode;
}) {
  return (
    <section
      className="grid bg-surface-muted lg:grid-cols-2"
      data-homepage-section="network"
    >
      <div className="space-y-5 px-6 py-20 lg:px-20">
        <EditableText
          as="p"
          className="uppercase tracking-widest"
          value={copy.eyebrow}
        />
        <h2 className="space-y-2 uppercase">
          <EditableText as="span" className="block" value={copy.titlePrefix} />
          <EditableText as="span" className="block" value={copy.titleSuffix} />
        </h2>
        <EditableText
          as="p"
          className="leading-relaxed"
          value={copy.description}
        />
        <EditableText
          as="span"
          className="inline-block rounded-md bg-premium-red px-7 py-4 uppercase !text-white"
          value={copy.viewDealersCta}
        />
      </div>
      <div className="min-h-96 border-l border-border-gray">
        {networkContent}
      </div>
    </section>
  );
}
