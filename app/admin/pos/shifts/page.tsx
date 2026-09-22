import { redirect } from "next/navigation";

export default function AdminPosShiftsRedirect() {
  redirect("/businesses/pos/shifts");
}
