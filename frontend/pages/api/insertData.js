export default async function handler(req, res) {
  try {
    fetch(`http://localhost/insert-crimes`);
    res.status(200).json({ message: "Request sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
