import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? serviceKey;
    
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Use service key to verify the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await adminClient.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized", detail: authError?.message }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: callerRole } = await adminClient.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle();
    if (!callerRole) return new Response(JSON.stringify({ error: "Forbidden: admin only", user_id: caller.id }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { action, ...body } = await req.json();

    if (action === "list") {
      const { data: { users }, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 });
      if (error) throw error;
      const { data: roles } = await adminClient.from("user_roles").select("*");
      const rolesMap: Record<string, string> = {};
      roles?.forEach((r: any) => { rolesMap[r.user_id] = r.role; });
      const result = users.map((u: any) => ({
        id: u.id, email: u.email, created_at: u.created_at,
        role: rolesMap[u.id] || "none",
      }));
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "create") {
      const { email, password, role } = body;
      if (!email || !password || !role) throw new Error("Missing fields");
      const { data: newUser, error } = await adminClient.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (error) throw error;
      await adminClient.from("user_roles").insert({ user_id: newUser.user.id, role });
      return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_role") {
      const { user_id, role } = body;
      if (!user_id || !role) throw new Error("Missing fields");
      // Prevent self-demotion
      if (user_id === caller.id) throw new Error("Cannot change own role");
      await adminClient.from("user_roles").delete().eq("user_id", user_id);
      await adminClient.from("user_roles").insert({ user_id, role });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete") {
      const { user_id } = body;
      if (!user_id) throw new Error("Missing user_id");
      if (user_id === caller.id) throw new Error("Cannot delete yourself");
      await adminClient.from("user_roles").delete().eq("user_id", user_id);
      const { error } = await adminClient.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
