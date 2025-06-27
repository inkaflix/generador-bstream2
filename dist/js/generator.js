let isSerie = document.getElementById("serie");
let isMovie = document.getElementById("movie");
let userInput = document.getElementById("movie-link");
let episodeContainer = document.getElementById("episodeContainer"); // Nuevo elemento
let types = document.querySelectorAll("input[type=radio][name=type]");
let numeroTemporadaInput = document.getElementById("numeroTemporada");
let inputsContainer = document.getElementById("inputs-container");
let api_key = "dc340e81a2bdef1a7bcb0b31358487fd";
let language = "es-MX";

types.forEach((type) => {
    type.addEventListener("change", () => {
        if (type.value == "movie") {
            document.getElementById("season-selector").style.display = "none";
            userInput.placeholder = "Buscar pelicula";

            // Ocultar el contenedor de episodios
            if (episodeContainer) {
                episodeContainer.style.display = 'none';
            }
        } else if (type.value == "serie") {
            document.getElementById("season-selector").style.display = "block";
            userInput.placeholder = "Buscar serie";

            // Mostrar el contenedor de episodios si estaba oculto previamente
            if (episodeContainer && episodeContainer.style.display === 'none') {
                episodeContainer.style.display = 'block';
            }
        }

        const searchTerm = searchInput.value;
        const searchType = isSerie.checked ? "tv" : "movie";
        if (searchTerm.trim() !== "") {
            searchMoviesOrSeries(searchTerm, searchType);
        }
    });
});


const searchInput = document.getElementById("movie-search");

searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value;
    const searchType = isSerie.checked ? "tv" : "movie";
    if (searchTerm.trim() !== "") {
        searchMoviesOrSeries(searchTerm, searchType);
    }
});


//movie
function updateInputVisibility() {
    userInput.style.display = isMovie.checked ? "block" : "none";
}

updateInputVisibility();
types.forEach((type) => {
    type.addEventListener("change", () => {
        updateInputVisibility();
        if (type.value === "movie") {
            // Si es una peli­cula, muestra el input
            userInput.style.display = "block";
        } else if (type.value === "serie") {
            // Si es una serie, oculta el input
            userInput.style.display = "none";
        }
    });
});

numeroTemporadaInput.addEventListener("input", () => {
    const serieId = document.getElementById("numero").value;
    generateInputsForAllSeasons(serieId);
});

async function searchMoviesOrSeries(searchTerm, searchType) {
    try {
        let url;
        if (searchType === "tv") {
            url = `https://api.themoviedb.org/3/search/tv?api_key=${api_key}&query=${searchTerm}&language=es-MX`;
        } else if (searchType === "movie") {
            url = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${searchTerm}&language=es-MX`;
        } else {
            console.error("Tipo de busqueda no valido");
            return;
        }

        const response = await fetch(url);

        if (response.status === 200) {
            const searchData = await response.json();
            displaySearchResults(searchData.results);
        } else {
            console.log("Error en la busqueda");
        }
    } catch (error) {
        console.error(error);
    }
}

function toggleResults() {
    const searchResultsContainer = document.getElementById('search-results-container');
    const toggleResultsButton = document.getElementById('toggle-results');

    if (searchResultsContainer.style.display === 'none') {
        searchResultsContainer.style.display = 'flex';
        toggleResultsButton.innerText = 'Ocultar Resultados';
    } else {
        searchResultsContainer.style.display = 'none';
        toggleResultsButton.innerText = 'Mostrar Resultados';
    }
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    const noResultsMessage = document.getElementById('no-results-message');
    const searchResultsContainer = document.getElementById('search-results-container');

    resultsContainer.innerHTML = ''; // Limpiar resultados anteriores

    if (results.length > 0) {
        results.forEach((result) => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('search-result-item');

            // Verificar si la imagen esta disponible
            const imageUrl = result.poster_path
                ? `https://image.tmdb.org/t/p/w300/${result.poster_path}`
                : 'https://www.puroverso.uy/images/virtuemart/product/9789974719019.jpg';

            resultItem.innerHTML = `
                 <img src="${imageUrl}" alt="${result.title || result.name}" />
                 <div class="result-info">
                     <p class="result-title"><strong>Título:</strong> <span>${result.title || result.name}</span></p>
                     <p class="result-year"><strong>Año:</strong> <span>${result.first_air_date ? result.first_air_date.slice(0, 4) : (result.release_date ? result.release_date.slice(0, 4) : 'N/A')}</span></p>
                     <p class="result-id"><strong>ID:</strong> <span>${result.id}</span></p>
                 </div>
             `;

            resultItem.addEventListener('click', () => {
                // Al hacer clic en un resultado, actualizar el campo ID y generar la informacion
                document.getElementById('numero').value = result.id;
                generateInputsForAllSeasons(result.id);
                document.getElementById("titulo-entrada").value = result.title || result.name;
                // Ocultar resultados despues de hacer clic en un resultado
                searchResultsContainer.style.display = 'none';
                document.getElementById('toggle-results').innerText = 'Mostrar Resultados';
            });

            resultsContainer.appendChild(resultItem);
        });

        updateToggleResultsButton();

        // Mostrar resultados y ocultar mensaje de no hay resultados
        searchResultsContainer.style.display = 'block';
        noResultsMessage.style.display = 'none';
    } else {
        // Ocultar resultados y mostrar mensaje de no hay resultados
        searchResultsContainer.style.display = 'none';
        noResultsMessage.style.display = 'block';
    }
}


// Nueva funcion para actualizar el texto del boton cuando cambia la visibilidad del contenedor
function updateToggleResultsButton() {
    const searchResultsContainer = document.getElementById('search-results-container');
    const toggleResultsButton = document.getElementById('toggle-results');

    if (searchResultsContainer.style.display === 'none') {
        toggleResultsButton.innerText = 'Mostrar Resultados';
    } else {
        toggleResultsButton.innerText = 'Ocultar Resultados';
    }
}

function convertMinutes(minutess) {
    let hours = Math.floor(minutess / 60),
        minutes = Math.floor(minutess % 60),
        total = "";

    if (minutess < 60) {
        total = `${minutes}m`;
        return total;
    } else if (minutess > 60) {
        total = `${hours}h ${minutes}m`;
        return total;
    } else if ((minutess === 60)) {
        total = `${hours}h`;
        return total;
    }
}

function formatLink(originalLink) {
    // Verificar si el enlace original ya esta en el formato esperado
    if (originalLink.includes("streamwish.to/e/")) {
        return originalLink; // Devolver el enlace original si ya esta en el formato esperado
    }

    // Extraer el codigo del enlace original
    const match = originalLink.match(/[^\/]+$/);
    if (match) {
        const code = match[0];
        // Construir el enlace en el formato esperado
        return `https://streamwish.to/e/${code}`;
    } else {
        // Devolver el enlace original si no se puede extraer el codigo
        return originalLink;
    }
}

// Inicializar el array bidimensional para almacenar los enlaces de cada temporada
let episodeContent = [];

async function generateInputsForAllSeasons(serieId) {
    try {
        // Limpiar el contenedor de inputs antes de agregar nuevos
        let inputsContainer = document.getElementById("inputs-container");
        inputsContainer.innerHTML = "";

        // Obtener el numero total de temporadas de la serie
        let seriesResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${serieId}?api_key=dc340e81a2bdef1a7bcb0b31358487fd&language=es-MX`
        );

        if (seriesResponse.status === 200) {
            let serieData = await seriesResponse.json();

            // Iterar sobre cada temporada
            for (let seasonNumber = 1; seasonNumber <= serieData.number_of_seasons; seasonNumber++) {
                // Obtener datos de la temporada actual
                let seasonDataResponse = await fetch(
                    `https://api.themoviedb.org/3/tv/${serieId}/season/${seasonNumber}?api_key=dc340e81a2bdef1a7bcb0b31358487fd&language=es-MX`
                );

                if (seasonDataResponse.status === 200) {
                    let seasonData = await seasonDataResponse.json();
                    let episodeCount = seasonData.episodes.length;

                    // Crear un contenedor para los inputs de la temporada actual
                    let seasonContainer = document.createElement("div");
                    seasonContainer.classList.add("season-container");
                    seasonContainer.id = `season-${seasonNumber}`;

                    // Crear un titulo para la temporada
                    let seasonTitle = document.createElement("h2");
                    seasonTitle.textContent = `Temporada ${seasonNumber}`;
                    seasonContainer.appendChild(seasonTitle);

                    // Crear un array para almacenar los enlaces de la temporada actual
                    let seasonLinks = [];

                    // Generar inputs para cada episodio de la temporada actual
                    for (let i = 0; i < episodeCount; i++) {
                        let inputId = `episode-${seasonNumber}-${i + 1}`;

                        // Crear el input
                        let input = document.createElement("input");
                        input.type = "text";
                        input.id = inputId;
                        input.placeholder = `Episodio ${i + 1}`;
                        // Agregar un event listener para escuchar cambios en el input
                        input.addEventListener("input", (event) => {
                            let inputValue = event.target.value;
                            // Guardar el ultimo cambio en el array
                            seasonLinks[i] = inputValue;
                            console.log(episodeContent);
                        });
                        seasonContainer.appendChild(input);
                    }

                    // Agregar el contenedor de la temporada al contenedor principal
                    inputsContainer.appendChild(seasonContainer);
                    // Agregar el array de enlaces de la temporada al array bidimensional
                    episodeContent.push(seasonLinks);
                } else {
                    console.log(`Error al obtener informacion de la temporada ${seasonNumber}`);
                }
            }
            console.log(episodeContent); // Aqui puedes ver el contenido de episodeContent
            return episodeContent; // Devolver episodeContent
        } else {
            console.log("Error al obtener informacion de la serie");
        }
    } catch (error) {
        console.error("Error inesperado:", error);
    }
}



// Array global para almacenar los generos
let generosGlobal = [];

async function generar() {
    let serieKey = document.getElementById("numero").value;

    const cargarPeliculas = async () => {
        if (isSerie.checked) {
            try {
                const serieId = document.getElementById("numero").value;
                const serieResponse = await fetch(`https://api.themoviedb.org/3/tv/${serieId}?api_key=${api_key}&language=${language}`);
                const serieData = await serieResponse.json();

                // Obtener los creadores de la serie
                let creators = '';
                serieData.created_by.forEach((creator, index) => {
                    creators += creator.name;
                    if (index < serieData.created_by.length - 1) {
                        creators += ', ';
                    }
                });

                // Obtener los generos de la serie
                let tags = '';
                serieData.genres.forEach((genre, index) => {
                    // Agregar una coma si no es el primer genero
                    if (index !== 0) {
                        tags += ', ';
                    }
                    // Reemplazar "&" por ","
                    const genreName = genre.name.replace(' & ', ', ');
                    tags += genreName;
                });

                let episodesHTML = '';
                const episodeContent = await generateInputsForAllSeasons(serieId); // Obtener los enlaces de cada episodio

                for (let seasonNumber = 1; seasonNumber <= serieData.number_of_seasons; seasonNumber++) {
                    const seasonResponse = await fetch(`https://api.themoviedb.org/3/tv/${serieId}/season/${seasonNumber}?api_key=${api_key}&language=${language}`);
                    const seasonData = await seasonResponse.json();

                    const episodes = [];
                    for (const [index, episode] of seasonData.episodes.entries()) {
                        // Obtener el enlace del episodio correspondiente
                        const episodeUrl = episodeContent[seasonNumber - 1][index]; // Los indices en los arrays comienzan en 0, por eso restamos 1 a seasonNumber

                        // Obtener la sinopsis del episodio
                        let synopsis = episode.overview;

                        // Si la sinopsis no esta disponible en es-MX, intentar obtenerla en es
                        if (!synopsis) {
                            const esResponse = await fetch(`https://api.themoviedb.org/3/tv/${serieId}/season/${seasonNumber}/episode/${episode.episode_number}/translations?api_key=${api_key}`);
                            const esData = await esResponse.json();
                            const esOverview = esData.translations.find(trans => trans.iso_3166_1 === 'ES');
                            synopsis = esOverview ? esOverview.data.overview : 'No disponible en este idioma';
                        }

                        // Construir el HTML para cada episodio
                        const imageUrl = `https://image.tmdb.org/t/p/w300/${episode.still_path}`;
                        const runtime = episode.runtime ? `${episode.runtime}m` : 'N/A';
                        const episodeHTML = `
                            <li>
                                <a href="#!" class="episode episode-link" data-url="${episodeUrl}">
                                    <div class="episode__img">
                                        <img src="${imageUrl}" onerror="this.style='display:none';">
                                        <div class="episode__no-image"><i class="fa-regular fa-circle-play"></i></div>
                                    </div>
                                    <div class="episode__info">
                                        <h4 class="episode__info__title">${episode.episode_number}. ${episode.name}</h4>
                                        <div class="episode__info__duration">${runtime}</div>
                                        <p class="sinopsis-info">${synopsis}</p>
                                    </div>
                                </a>
                            </li>`;
                        episodes.push(episodeHTML);
                    }

                    // Determinar la clase para el contenedor de episodios
                    const seasonClass = seasonNumber === 1 ? 'animation' : 'hide';

                    // Agregar los episodios de la temporada actual al HTML final
                    episodesHTML += `
                        <ul class="caps-grid ${seasonClass}" id="season-${seasonNumber}">
                            ${episodes.join('')}
                        </ul>`;
                }


                let seasonsOption = "";

                serieData.seasons.forEach(season => {
                    if (season.name != "Especiales") {
                        seasonsOption += `<option value="${season.season_number}">Temporada ${season.season_number}</option>
                    `;
                    }
                });

                let genSeasonsCount;

                if (serieData.number_of_seasons == 1) {
                    genSeasonsCount = " Temporada";
                } else if (serieData.number_of_seasons > 1) {
                    genSeasonsCount = " Temporadas";
                }

                // Construir el HTML final
                let htmlFinal = `
                <div class="post-header">
                <div class="filter">
                <div class="background-image" style="background-image: url(https://image.tmdb.org/t/p/w500${serieData.backdrop_path});"></div>
                        </div>
                <div class="image-and-btn">
                <img src="https://image.tmdb.org/t/p/w300/${serieData.poster_path}" class="poster-img" alt="" />
                <div class="fav-js">
                <button class="bs-favs" card-id="${serieData.id}" id="add-btn"><i class="fa-regular fa-heart"></i> Añadir a mi lista</button>
                <button class="delete-btn none-btn" card-id="${serieData.id}" id="remove-btn"><i class="fa-solid fa-trash"></i> Borrar de mi lista</button>
                </div>
                </div>
                
                <div class="post-header__info">
                <h1>${serieData.name}</h1>
                <ul>
                <li class="tmdb-rate"><i class="fa-solid fa-star"></i> ${serieData.vote_average.toFixed(1)}</li>
                <li>${serieData.number_of_seasons + genSeasonsCount}</li>
                <li>${serieData.first_air_date.slice(0, 4)}</li>
                </ul>
                <p class="resume">${serieData.overview}</p>
                <div class="more-data">
                <p>Género: ${tags}</p>
                <p>Created by: ${creators}</p>
                </div>
                </div>
                </div>
                <!-- Ventana Modal Video -->
                <div id="myModal" class="modal-videos">
                <div class="modal-content-videos" id="transmitirEpisode">
                <span id="closeModal" onclick="closeModal">&times;</span>
                <div id="modalContent" class="iframe-container"></div>
                </div>
                </div>
                <!--more-->
                <div class="season-list">
                <div class="select-season">
                <h2>Episodios</h2>
                <select name="" id="select-season">
                ${seasonsOption}
                </select>
                </div>
                <div id="temps">
                ${episodesHTML}
                </div>
                </div>`;

                // Agregar el HTML final al elemento con el ID "html-final"
                document.getElementById('html-final').innerText = htmlFinal;

                // Limpiar el contenido del array episodeContent
                episodeContent.length = 0;
            } catch (error) {
                console.error('Error al generar los episodios:', error);
            }


        } else if (isMovie.checked) {
            try {
                const respuesta = await fetch(
                    `https://api.themoviedb.org/3/movie/${serieKey}?api_key=dc340e81a2bdef1a7bcb0b31358487fd&language=${language}`
                );

                if (respuesta.status === 200) {
                    const datos = await respuesta.json();
                    // console.log(datos);//

                    let ageRatingHtml = ""; // Variable para almacenar el HTML de la clasificacion por edad

                    const idiomasPredeterminados = ["AR", "ES", "EN", "MX", "UA", "BR", "PR", "CO", "CL", "PE", "VE", "EC", "GT", "CU", "BO", "DO", "HN", "PY", "SV", "NI", "CR", "PA", "UY", "JM", "BS", "BB", "HT", "TT", "KY", "BM", "GY", "SR", "BZ", "AN", "LC", "AG", "DM", "GD", "KN", "VC", "TT", "US", "DE", "FR", "GB"]; // Agrega aqui los idiomas que desees buscar

                    const certificationResponse = await fetch(
                        `https://api.themoviedb.org/3/movie/${serieKey}/release_dates?api_key=dc340e81a2bdef1a7bcb0b31358487fd`
                    );

                    if (certificationResponse.status === 200) {
                        const certifications = await certificationResponse.json();

                        for (const idioma of idiomasPredeterminados) {
                            const certification = certifications.results.find((result) => result.iso_3166_1 === idioma);

                            if (certification && certification.release_dates.length > 0) {
                                const ageRating = certification.release_dates[0].certification;

                                if (ageRating && !isNaN(ageRating.trim())) {
                                    console.log(`Clasificacion por edad para ${idioma}: ${ageRating}`);
                                    // Puedes utilizar ageRating en tu HTML o en cualquier otra parte de tu codigo.
                                    ageRatingHtml = `<p class="section__date-edad">+${ageRating}</p>`;
                                    break; // Salimos del bucle una vez que encontramos una clasificaciÃon por edad valida.
                                } else {
                                    console.log(`La clasificacion por edad para ${idioma} no es un numero valido.`);
                                    // Manejar la situacion en la que la clasificacion por edad no es un numero valido.
                                }
                            } else {
                                console.log(`No se encontro clasificacion por edad para ${idioma}`);
                                // Manejar la situacion en la que no se encuentra la clasificacion por edad para el idioma especificado.
                            }
                        }
                    } else {
                        console.log("Error al obtener la clasificacion por edad");
                        // Manejar el error al obtener la clasificacion por edad.
                    }

                    // Obtener el valor del primer input
                    const userInputA = document.getElementById('userInputA').value;
                    const userInputB = document.getElementById('userInputB').value;
                    // Funcion para convertir el enlace al formato deseado
                    function convertirFormato(codigo) {
                        // Extrae el codigo despues de la ultima barra "/"
                        const codigoDespuesDeBarra = codigo.substring(codigo.lastIndexOf('/') + 1);

                        // Formato 1: oneupload.to/embed-{codigo}
                        const formatoUno = `streamwish.to/e/${codigoDespuesDeBarra}`;

                        // Formato 2: https://oneupload.to/embed-{codigo}
                        const formatoDos = `https://${formatoUno}`;

                        return { formatoUno, formatoDos };
                    }

                    // Aplica la conversion al valor del primer input
                    const resultado = convertirFormato(userInputA);

                    // Ahora 'resultado' contiene los enlaces convertidos
                    console.log(resultado.formatoUno); // Muestra: oneupload.to/embed-7s56g3blv0s6
                    console.log(resultado.formatoDos); // Muestra: https://oneupload.to/embed-7s56g3blv0s6


                    // Obtener los generos de la serie
                    let tags = '';
                    datos.genres.forEach((genre, index) => {
                        // Agregar una coma si no es el primer genero
                        if (index !== 0) {
                            tags += ', ';
                        }
                        // Reemplazar "&" por ","
                        const genreName = genre.name.replace(' & ', ', ');
                        tags += genreName;
                    });

                    let template = document.getElementById("html-final");

                    let justHtml = `
                    <div class="post-header">
<div class="filter"><div class="background-image" style="background-image: url(https://image.tmdb.org/t/p/w500${datos.backdrop_path
                        });"></div></div>
<div class="image-and-btn">
<img src="https://image.tmdb.org/t/p/w300${datos.poster_path}" class="poster-img" alt="" />
<div class="fav-js">
<button class="bs-favs" card-id="${datos.id}" id="add-btn"><i class="fa-regular fa-heart"></i> Añadir a mi lista</button>
<button class="delete-btn none-btn" card-id="${datos.id}" id="remove-btn"><i class="fa-solid fa-trash"></i> Borrar de mi lista</button>
</div>
</div>

<div class="post-header__info">
<h1>${datos.title}</h1>
<ul>
<li class="tmdb-rate"><i class="fa-solid fa-star"></i> ${datos.vote_average.toFixed(1)}</li>
<li>${datos.release_date.slice(0, 4)}</li> 
<li>${convertMinutes(datos.runtime)}</li>
${ageRatingHtml}
</ul>
<p class="resume">${datos.overview}</p>
<div class="more-data">
<p>Género: ${tags}</p>
</div>
</div>
</div>
<a href="wvc-x-callback://open?url=${userInputA}"><button class="hacker"><b>DESCARGAR TRANSMITIR</b></button>
<!--more-->
<div class="bs-video-player">
<ul class="player-options">
<li class="active">Opcion 1</li>
</ul>
<ul class="bs-iframes">
<li class="active">
<iframe allowfullscreen="" frameborder="0" height="215px" id="iframe1" onload="$('.iframe-loading').css('background-image', 'none');" sandbox="allow-same-origin allow-scripts" scrolling="no" src="${userInputA}" style="border: none;" width="100%"></iframe>
</li>
</ul>
</div>

                    `;
                    template.innerText = justHtml;

                    let genPoster = document.getElementById("info-poster");
                    let genTitle = document.getElementById("info-title");
                    let genSeasons = document.getElementById("info-seasons");
                    let genYear = document.getElementById("info-year");
                    let genSinopsis = document.getElementById("info-sinopsis")

                    genPoster.setAttribute(
                        "src",
                        `https://image.tmdb.org/t/p/w300/${datos.poster_path}`
                    );
                    genTitle.innerText = datos.title;
                    genSeasons.innerText = "";
                    genYear.innerText = datos.release_date.slice(0, 4);
                    genSinopsis.innerText = datos.overview;
                } else if (respuesta.status === 401) {
                    console.log("Wrong key");
                } else if (respuesta.status === 404) {
                    console.log("No existe");
                }
            } catch (error) {
                console.log(error);
            }
        }

    };

    await cargarPeliculas();
}


document.getElementById('copiar').addEventListener('click', function () {
    // Seleccionar el texto dentro del elemento html-final
    const htmlFinalText = document.getElementById('html-final').innerText;

    // Crear un elemento textarea temporal para copiar el texto
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = htmlFinalText;

    // Agregar el elemento textarea al cuerpo del documento
    document.body.appendChild(tempTextArea);

    // Seleccionar y copiar el texto dentro del textarea temporal
    tempTextArea.select();
    document.execCommand('copy');

    // Remover el textarea temporal
    document.body.removeChild(tempTextArea);

    // Notificar al usuario que el texto ha sido copiado
    alert('El HTML ha sido copiado al portapapeles.');
});

//aqui

// Funcion para iniciar sesion y obtener el token de acceso
function iniciarSesion() {
    window.location.href = 'https://accounts.google.com/o/oauth2/auth?' +
        'client_id=392804236703-llkr2saq5eao69qj10kd3or2dav3eg70.apps.googleusercontent.com' +
        '&redirect_uri=https://firego.a0001.net' +
        '&response_type=token' +
        '&scope=https://www.googleapis.com/auth/blogger' +
        '&approval_prompt=force';
}

// Funcion para obtener el token de acceso de la URL
function obtenerTokenDeURL() {
    var tokenRegex = /access_token=([^&]+)/;
    var match = window.location.hash.match(tokenRegex);
    if (match && match[1]) {
        var token = match[1];
        var tiempoExpiracion = Date.now() + 3500000; // Calcular el tiempo de expiracion del token (3500 segundos en milisegundos)
        // Guardar el token de acceso y el tiempo de expiracion en el almacenamiento local
        localStorage.setItem('accessToken', token);
        localStorage.setItem('tiempoExpiracion', tiempoExpiracion);
        // Insertar el token de acceso en el input
        document.getElementById('accessTokenInput').value = token;
        // Iniciar el contador de tiempo restante solo si no se ha iniciado previamente
        if (!localStorage.getItem('contadorIniciado')) {
            iniciarContador();
            localStorage.setItem('contadorIniciado', 'true');
        }
    }
}

// Funcion para iniciar el contador de tiempo restante
function iniciarContador() {
    // Obtener el tiempo de expiracion del token del almacenamiento local
    var tiempoExpiracion = localStorage.getItem('tiempoExpiracion');
    // Calcular el tiempo restante en milisegundos
    var tiempoRestante = tiempoExpiracion - Date.now();

    // Actualizar el contador en el DOM
    mostrarTiempoRestante(tiempoRestante);

    // Actualizar el contador cada segundo
    var contadorInterval = setInterval(function () {
        // Calcular el nuevo tiempo restante
        tiempoRestante = tiempoExpiracion - Date.now();
        // Verificar si el tiempo restante ha alcanzado cero
        if (tiempoRestante <= 0) {
            // Limpiar el intervalo y eliminar el token de acceso y el tiempo de expiracion del almacenamiento local
            clearInterval(contadorInterval);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('tiempoExpiracion');
            localStorage.removeItem('contadorIniciado');
            // Actualizar el contador en el DOM
            mostrarTiempoRestante(0);
        } else {
            // Actualizar el contador en el DOM
            mostrarTiempoRestante(tiempoRestante);
        }
    }, 1000);
}

function mostrarTiempoRestante(tiempoRestante) {
    var segundosRestantes = Math.ceil(tiempoRestante / 1000);
    var contadorElemento = document.getElementById('contador');
    contadorElemento.textContent = 'Tiempo restante: ' + segundosRestantes + ' segundos';
    console.log('Mostrando tiempo restante:', segundosRestantes);
}

// Llamar a la funcion para obtener el token de acceso de la URL cuando se cargue la pagina
obtenerTokenDeURL();

// Funcion para enviar el HTML a Blogger
function enviarHTML() {
    const tituloEntrada = document.getElementById('titulo-entrada').value;
    var token = localStorage.getItem('accessToken');
    if (token) {
        var html = document.getElementById('html-final').innerText;

        // Obtener los gÃ©neros del array global y formatearlos como etiquetas
        const etiquetas = generosGlobal.join(', ');

        // Logica para enviar el HTML a Blogger utilizando el token de acceso
        fetch('https://www.googleapis.com/blogger/v3/blogs/7419122148924124873/posts/', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'kind': 'blogger#post',
                'blog': {
                    'id': '7419122148924124873'
                },
                'title': tituloEntrada,
                'content': html
            })
        })
            .then(response => {
                if (response.ok) {
                    alert('HTML enviado a Blogger exitosamente.');
                    // Limpiar el array de generos despues de enviar el HTML
                    generosGlobal = [];
                } else {
                    alert('Error al enviar HTML a Blogger: ' + response.statusText);
                }
            })
            .catch(error => alert('Error de red: ' + error));
    } else {
        alert('No se ha encontrado un token de acceso.');
    }
}f