const btnClima = document.getElementById('btnClima');
const inputCiudad = document.getElementById('ciudad');
const estado = document.getElementById('estado');
const contenidoResultado = document.getElementById('contenidoResultado');
const resultado = document.getElementById('resultado');

btnClima.addEventListener('click', () => {
  const ciudad = inputCiudad.value.trim();

  if (!ciudad) {
    estado.textContent = 'Ingresa el nombre de una ciudad.';
    return;
  }

  estado.textContent = 'Consultando...';
  contenidoResultado.innerHTML = '';

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1`)
    .then((geoResponse) => {
      if (!geoResponse.ok) {
        throw new Error(`Error en geocodificación: ${geoResponse.status} ${geoResponse.statusText}`);
      }
      return geoResponse.json();
    })
    .then((geoData) => {
      const primeraCiudad = geoData?.results?.[0];

      if (!primeraCiudad) {
        estado.textContent = 'Ciudad no encontrada';
        return;
      }

      const { latitude, longitude, name, country } = primeraCiudad;

      return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
        .then((weatherResponse) => {
          if (!weatherResponse.ok) {
            throw new Error(`Error al obtener el clima: ${weatherResponse.status} ${weatherResponse.statusText}`);
          }
          return weatherResponse.json();
        })
        .then((weatherData) => {
          const current = weatherData?.current_weather;

          if (!current) {
            throw new Error('No se encontró el clima actual para esta ubicación.');
          }

          estado.textContent = 'Clima consultado correctamente.';
          contenidoResultado.innerHTML = `
            <div class="result-item"><span>Ciudad:</span><strong>${name}, ${country || ''}</strong></div>
            <div class="result-item"><span>Temperatura:</span><strong>${current.temperature} °C</strong></div>
            <div class="result-item"><span>Velocidad del viento:</span><strong>${current.windspeed} km/h</strong></div>
            <div class="result-item"><span>Código de clima:</span><strong>${current.weathercode}</strong></div>
          `;
        });
    })
    .catch((error) => {
      estado.textContent = error?.message || 'Ocurrió un error al consultar el clima.';
      contenidoResultado.innerHTML = '<p>Vuelva a intentarlo más tarde.</p>';
    });
});

// Nota para Dario: particularmente prefiero realizar los fetch de manera separada, consultar primero la geocodificación y luego el clima, para poder manejar mejor los errores y mostrar mensajes más claros al usuario.
