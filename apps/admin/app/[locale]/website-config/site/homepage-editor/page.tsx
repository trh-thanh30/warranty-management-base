import { AuthGuard } from "@/src/components/auth-guard";
import { HomepageEditorView } from "@/src/views/website-config/site/homepage-editor.view";

export default function HomepageEditorPage() {
  return (
    <AuthGuard>
      <HomepageEditorView />
    </AuthGuard>
  );
}
