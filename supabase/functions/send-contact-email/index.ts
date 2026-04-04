const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { name, email, phone, subject, message } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not set");
    }

    const phoneRow = phone ? `
          <tr>
            <td style="padding: 10px; color: #DBB155; font-weight: bold;">رقم الجوال:</td>
            <td style="padding: 10px; color: #f5f5f5;" dir="ltr">${phone}</td>
          </tr>` : '';

    const htmlBody = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #f5f5f5; padding: 30px; border-radius: 10px; border: 1px solid #DBB155;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #DBB155; font-size: 24px; margin: 0;">The View Avenue</h1>
          <p style="color: #aaa; font-size: 14px; margin: 4px 0;">رسالة جديدة من نموذج التواصل</p>
        </div>
        <hr style="border-color: #DBB155; margin-bottom: 24px;" />
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; color: #DBB155; font-weight: bold; width: 30%;">الاسم:</td>
            <td style="padding: 10px; color: #f5f5f5;">${name}</td>
          </tr>
          <tr style="background: #222;">
            <td style="padding: 10px; color: #DBB155; font-weight: bold;">البريد الإلكتروني:</td>
            <td style="padding: 10px; color: #f5f5f5;" dir="ltr">${email}</td>
          </tr>
          ${phoneRow}
          <tr style="background: #222;">
            <td style="padding: 10px; color: #DBB155; font-weight: bold;">الموضوع:</td>
            <td style="padding: 10px; color: #f5f5f5;">${subject}</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #DBB155; font-weight: bold; vertical-align: top;">الرسالة:</td>
            <td style="padding: 10px; color: #f5f5f5; white-space: pre-wrap;">${message}</td>
          </tr>
        </table>
        <hr style="border-color: #DBB155; margin-top: 24px;" />
        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 16px;">
          تم الإرسال من موقع <a href="https://www.theviewavenue.net" style="color: #DBB155;">theviewavenue.net</a>
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "The View Avenue <noreply@theviewavenue.net>",
        to: ["azoooz.jeddah@gmail.com"],
        reply_to: email,
        subject: `رسالة جديدة: ${subject}`,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
