import { redirect } from "next/navigation";

export default function ExamPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/exam/${params.id}/overview`);
}
