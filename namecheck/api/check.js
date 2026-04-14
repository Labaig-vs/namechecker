export default async function handler(req, res) {
  // 1. Recibir parámetros del frontend (nombres, territorios, clases)
  const nombre = (req.query.nombre || '').trim().toUpperCase();
  const territories = req.query.territories ? req.query.territories.split(',') : [];
  const classes = req.query.classes ? req.query.classes.split(',') : [];

  if (req.query.health) {
    try {
      if (!process.env.EUIPO_API_KEY) {
        return res.status(500).json({ status: 'error', message: 'Falta API Key en Vercel' });
      }
      // Opcional: Podrías hacer un fetch rápido a la EUIPO aquí para confirmar
      return res.status(200).json({ status: 'ok', message: 'Conectado con EUIPO' });
    } catch (e) {
      return res.status(500).json({ status: 'error' });
    }
  }

  try {
    // 2. Configurar credenciales y URL
    // MUY IMPORTANTE: La API_KEY debe estar en las Variables de Entorno de Vercel.
    const API_KEY = process.env.EUIPO_API_KEY; 
    
    // NOTA: Esta es una URL de ejemplo. Una vez tengas acceso, la documentación 
    // de la EUIPO/TMview te dará el endpoint exacto que debes usar aquí.
    const EUIPO_API_URL = 'https://api.euipo.europa.eu/v1/trademarks/search'; 

    // 3. Hacer la llamada a la API oficial
    const apiResponse = await fetch(`${EUIPO_API_URL}?name=${encodeURIComponent(nombre)}`, {
      method: 'GET', // (Revisa en la doc de EUIPO si requiere POST o GET)
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!apiResponse.ok) {
      throw new Error(`La API respondió con status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    // 4. Filtrar y procesar los resultados reales
    // (Asegúrate de ajustar "data.results" al campo real que devuelva el JSON de EUIPO)
    let conflicts = data.results || [];

    // Filtrar por territorios (si el usuario seleccionó alguno)
    if (territories.length > 0) {
       conflicts = conflicts.filter(c => territories.includes(c.territory.toLowerCase()));
    }
    
    // Filtrar por clases Nice (si el usuario seleccionó alguna)
    if (classes.length > 0) {
       conflicts = conflicts.filter(c => classes.includes(String(c.classCode)));
    }

    // 5. Mapear los datos al formato exacto que espera tu Frontend
    // (Los nombres de las variables como 'markName' o 'officeCode' dependerán del JSON de la API)
    const formattedConflicts = conflicts.map(item => ({
      name: item.markName,
      owner: item.applicantName || 'Desconocido',
      territory: item.officeCode || '-', 
      class: item.niceClasses && item.niceClasses.length > 0 ? item.niceClasses[0] : '-',
      status: item.markStatus === 'Registered' ? 'registered' : 
              item.markStatus === 'Application' ? 'application' : 'expired',
      sim: item.similarityScore || 1 
    }));

    // 6. Lógica de cálculo de riesgo
    let risk = 'green';
    if (formattedConflicts.length > 0) {
      // Si hay al menos un conflicto registrado activamente, marcamos en rojo. Si no, en naranja.
      const hasActive = formattedConflicts.some(c => c.status === 'registered');
      risk = hasActive ? 'red' : 'amber';
    }

    // 7. Devolver respuesta limpia al frontend (solo enviamos el Top 5 para no saturar la tabla)
    return res.status(200).json({
      risk: risk,
      conflicts: formattedConflicts.slice(0, 5)
    });

  } catch (error) {
    console.error('Error en el backend comunicándose con la API:', error);
    return res.status(500).json({ error: 'Error comunicándose con la base de datos oficial.' });
  }
}