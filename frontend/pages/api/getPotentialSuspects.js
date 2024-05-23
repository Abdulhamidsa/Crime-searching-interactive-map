export default async function handler(req, res) {
  const { criminal_id } = req.query;
  console.log(criminal_id);
  try {
    const response = await fetch(`http://localhost/getass/${criminal_id}`);
    const data = await response.json();
    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json({ error: data.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
