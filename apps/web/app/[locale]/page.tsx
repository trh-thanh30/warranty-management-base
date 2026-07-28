import { HomeView } from "@/src/views/home/home.view";

export default function Page(props: Parameters<typeof HomeView>[0]) {
  return <HomeView {...props} />;
}
