// api/proxy.js
export default async function handler(req, res) {
  const apiUrl = 'https://api.pococha.com/v1/liver_score_events/01JPGY77RX9AHKM3TTQ12FE6JT/rankings';
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    // CORS 許可
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Pococha API' });
  }
}
