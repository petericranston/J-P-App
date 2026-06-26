const supabase = require("./supabase");

const toDateStr = (d) => d.toISOString().split("T")[0];

// Called immediately after a successful check-in insert.
async function updateStreakOnCheckin(pactId) {
  const today = toDateStr(new Date());

  const { data: existing, error: fetchErr } = await supabase
    .from("streaks")
    .select("*")
    .eq("pact_id", pactId)
    .single();

  if (fetchErr && fetchErr.code !== "PGRST116") throw fetchErr;

  if (!existing) {
    const { error: insertErr } = await supabase.from("streaks").insert({
      pact_id: pactId,
      current_streak: 1,
      longest_streak: 1,
      shield_used: false,
      last_checkin_date: today,
    });
    if (insertErr) throw insertErr;
    return { current_streak: 1, longest_streak: 1 };
  }

  if (existing.last_checkin_date === today) {
    return {
      current_streak: existing.current_streak,
      longest_streak: existing.longest_streak,
    };
  }

  const yesterday = toDateStr(new Date(Date.now() - 86400000));
  const newStreak =
    existing.last_checkin_date === yesterday ? existing.current_streak + 1 : 1;
  const newLongest = Math.max(newStreak, existing.longest_streak);

  const { error: updateErr } = await supabase
    .from("streaks")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_checkin_date: today,
    })
    .eq("pact_id", pactId);

  if (updateErr) throw updateErr;

  return { current_streak: newStreak, longest_streak: newLongest };
}

module.exports = { updateStreakOnCheckin };
