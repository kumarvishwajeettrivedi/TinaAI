import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { INTERVIEWERS } from "@/lib/constants";
import { nanoid } from "nanoid";

export async function GET() {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        // 1. Delete all interviewers
        const { error: deleteError } = await supabase
            .from("interviewer")
            .delete()
            .neq("id", 0); // Delete all rows where id is not 0 (effectively all)

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        // 2. Create Tina
        const tinaAgentId = `agent_tina_${nanoid(10)}`;
        const { error: tinaError } = await supabase.from("interviewer").insert({
            agent_id: tinaAgentId,
            ...INTERVIEWERS.TINA,
        });

        if (tinaError) {
            return NextResponse.json({ error: tinaError.message }, { status: 500 });
        }

        // 3. Create Sameer
        const sameerAgentId = `agent_sameer_${nanoid(10)}`;
        const { error: sameerError } = await supabase.from("interviewer").insert({
            agent_id: sameerAgentId,
            ...INTERVIEWERS.SAMEER,
        });

        if (sameerError) {
            return NextResponse.json({ error: sameerError.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Cleanup successful. Only Tina and Sameer exist." });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
