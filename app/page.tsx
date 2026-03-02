import { redirect } from "next/navigation";

export default function Home() {
  // Directly route users to dashboard. The layout guards will handle unauthenticated states.
  redirect("/dashboard");
}
