// api/proxy.js
export default async function handler(req, res) {
  // クエリから eventId を取得
  const eventId = req.query.eventId;
  if (!eventId) {
    return res
      .status(400)
      .json({ error: 'eventId が指定されていません。例: /api/proxy?eventId=01JPGY…' });
  }

  // Pococha 内部API の URL（eventId 部分だけ動的に）
  const apiUrl = `https://api.pococha.com/v1/liver_score_events/${eventId}/rankings`;

  try {
    // 内部API にリクエスト
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`内部APIエラー: ${response.status}`);
    }
    const data = await response.json();

    // CORS をすべて許可
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: '内部API取得に失敗しました。', details: err.message });
  }
}
