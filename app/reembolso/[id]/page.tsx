// app/reembolso/[enlace]/page.tsx
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { RefundCard } from "@/components/refund-card";
export const dynamic = "force-dynamic"; // <--- ¡IMPORTANTE!

export default async function ReembolsoPage({ params }: { params: { id: string } }) {
  const { data: reembolso, error } = await supabase
    .from("reembolsos")
    .select("*")
.eq("enlace_publico", params.id)
    .single();

  if (!reembolso || error) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <RefundCard
        id={reembolso.id}
        importe={reembolso.monto?.toString() || "0"}
        clabe={reembolso.clabe}
        empresa={reembolso.empresa}
        telefono={reembolso.telefono}
        estado={reembolso.estado}
        convenienceText={reembolso.convenienceText} // Asegúrate de pasar este prop

      />
    </div>
  );
}
