import { redirect } from "next/navigation";

export default function SpiderFootPage() {
  redirect("/tools?tool=spiderfoot");
}
