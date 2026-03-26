export default async function handler(req, res) {
  // Devuelve un JSON de ejemplo.
  // En producción, haz aquí la llamada a EUIPO/OEPM, manejo de errores, cache, etc.
  
  const nombre = (req.query.nombre || '').toUpperCase();

  if (!nombre) {
    return res.status(400).json({ error: 'Falta parámetro nombre' });
  }

  // Simulación rápida de respuesta
  const mock = {
    AURORA: { risk: 'red', conflicts: [{ name: 'AURORA', owner: 'Aurora Digital S.L.', territory: 'EU', class: 35, status: 'registered', sim: 0.95 }] },
    DEFAULT: { risk: 'green', conflicts: [] }
  };

  const result = mock[nombre] || mock.DEFAULT;
  return res.status(200).json(result);
}
