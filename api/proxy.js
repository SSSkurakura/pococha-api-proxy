// api/proxy.js

// モジュールトップレベルでキャッシュ用オブジェクトを定義
const cache = {};  
const TTL = 5 * 1000; // キャッシュ有効期間：5秒

export default async function handler(req, res) {
  const eventId = req.query.eventId;
  if (!eventId) {
    return res
      .status(400)
      .json({ error: 'eventId が指定されていません。?eventId=01JPGY… の形式で呼び出してください' });
  }

  const now = Date.now();

  // キャッシュヒット判定
  if (cache[eventId] && (now - cache[eventId].timestamp) < TTL) {
    // HTTPヘッダーはキャッシュ用も含めてそのまま返却
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10');
    return res.status(200).json(cache[eventId].data);
  }

  // キャッシュミス or TTL切れ → 内部API呼び出し
  const apiUrl = `https://api.pococha.com/v1/liver_score_events/${eventId}/rankings`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`内部APIエラー: ${response.status}`);
    }
    const data = await response.json();

    // メモリキャッシュに保存
    cache[eventId] = {
      data,
      timestamp: now
    };

    // CORS と CDNキャッシュヘッダーを付与して返却
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10');
    res.status(200).json(data);

  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: '内部API取得に失敗しました。', details: err.message });
  }
}
