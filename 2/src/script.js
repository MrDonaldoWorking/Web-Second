// api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}

const APIkey = "5b8da300caa2c2c6eac11464f623fe57"
const url_pref = "https://api.openweathermap.org/data/2.5/weather?"
let city = "Ouagadougou"
let latitude = 12.36
let longitude = -1.54

const success = pos => {
    let crd = pos.coords;

    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);

    let url = url_pref + "lat=" + crd.latitude + "&lon=" + crd.longitude + "&APIKEY=" + APIkey
    set_header_info(url)
}

const error = err => {
    console.warn(`ERROR(${err.code}): ${err.message}`);

    let url = url_pref + "q=" + city + "&APIKEY=" + APIkey
    set_header_info(url)
}

const rqst_geo = () => navigator.geolocation.getCurrentPosition(success, error);

function show_err_msg(...args) {
    alert(args)
}

function err_retrieving(...args) {
    show_err_msg("Ошибка при получении данных о погоде, ", args)
}

function retrieve(html_part, arr) {
    if (arr.length === 0) {
        return html_part;
    }

    let curr = arr.pop();
    return retrieve(html_part, arr).children[curr];
}

async function set_header_info(url) {
    const loading = document.getElementById("header-loading");
    const brief = document.getElementById("header-brief");
    const details = document.getElementById("header-details");

    loading.style.display = "flex";
    brief.style.display = details.style.display = "none";

    url = url + "&units=metric";
    console.log(url);
    // const data = fetch(url).then(data => data.json(), err => err_retrieving(err)).catch(err_retrieving);
    const data = await fetch(url).then(response => {
        console.log("In then() function");
        console.log(response);
        return response.json();
    }, err => err_retrieving(err)).catch(err_retrieving);
    console.log("after fetching");

    // brief
    // city
    console.log("city is " + data.name);
    retrieve(brief, [0]).innerHTML = data.name;
    // weather icon
    console.log("weather icon is " + data.weather[0].icon)
    retrieve(brief, [1, 0]).src = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    // temperature
    retrieve(brief, [1, 1]).innerHTML = data.main.temp + "°C";

    // details
    // wind
    retrieve(details, [0, 1]).innerHTML = data.wind.speed + "m/s, " + data.wind.deg + "°";
    // cloudiness
    retrieve(details, [1, 1]).innerHTML = data.clouds.all + "%";
    // pressure
    retrieve(details, [2, 1]).innerHTML = data.main.pressure + " hpa";
    // humidity
    retrieve(details, [3, 1]).innerHTML = data.main.humidity + "%";
    // coordinates
    retrieve(details, [4, 1]).innerHTML = "[" + data.coord.lat + ", " + data.coord.lon + "]";

    loading.style.display = "none";
    brief.style.display = details.style.display = "";
}