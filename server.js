const express = require('express');
const { WebcastPushConnection } = require('tiktok-live-connector');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let connection = null;

// ربط TikTok
app.post('/connect', async (req, res) => {
  const { username } = req.body;

  connection = new WebcastPushConnection(username);

  connection.on('chat', async (data) => {
    const comment = data.comment;

    let team = null;
    if (comment.includes('1')) team = 'algeria';
    if (comment.includes('2')) team = 'morocco';

    if (team) {
      await supabase.rpc('add_vote', {
        p_team: team,
        p_points: 1
      });
    }
  });

  await connection.connect();
  res.json({ success: true });
});

// اختبار
app.get('/status', (req, res) => {
  res.json({ ok: true });
});

app.listen(3000, () => console.log("Server running"));
