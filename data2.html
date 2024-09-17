<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flight Tracker</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body>
    <h1>Flight Tracker</h1>
    <input type="text" id="flightNumber" placeholder="Número de vuelo (ej: AA123)">
    <input type="date" id="flightDate" placeholder="Fecha de vuelo">
    <button id="checkStatus">Consultar Estado del Vuelo</button>
    <pre id="result"></pre>

    <script>
        document.getElementById('checkStatus').addEventListener('click', async () => {
            const flightNumber = document.getElementById('flightNumber').value;
            const flightDate = document.getElementById('flightDate').value;

            try {
                const response = await axios.post('http://localhost:3000/api/flight-status', {
                    date: flightDate,
                    flightNumber: flightNumber
                });
                document.getElementById('result').textContent = JSON.stringify(response.data, null, 2);
            } catch (error) {
                alert(error.response ? error.response.data.error : "Error desconocido");
            }
        });
    </script>
</body>
</html>
