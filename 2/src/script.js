// api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}

const APIkey = "5b8da300caa2c2c6eac11464f623fe57";
const url_pref = "https://api.openweathermap.org/data/2.5/weather?";
const city = "Ouagadougou";

async function success(pos) {
    let crd = pos.coords;

    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);

    const url = url_pref + "lat=" + crd.latitude + "&lon=" + crd.longitude + "&APIKEY=" + APIkey
    await set_header_info(url)
}

async function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);

    const url = url_pref + "q=" + city + "&APIKEY=" + APIkey
    await set_header_info(url)
}

async function rqst_geo() {
    navigator.geolocation.getCurrentPosition(success, error);
    await update_cities_from_local_storage();
}

function show_err_msg(...args) {
    alert(args)
}

function err_retrieving(...args) {
    show_err_msg("Ошибка при получении данных о городе, ", args)
}

function retrieve(html_part, arr) {
    if (arr.length === 0) {
        return html_part;
    }

    let curr = arr.pop();
    return retrieve(html_part, arr).children[curr];
}

async function get_json_data(url) {
    return await fetch(url).then(response => {
        console.log("In then() function");
        console.log(response);
        return response.json();
    }, err => err_retrieving(err)).catch(err_retrieving);
}

function set_details(details, data) {
    // details
    // wind
    console.log("wind " + data.wind.speed + "m/s, " + data.wind.deg + "°");
    retrieve(details, [0, 1]).innerHTML = data.wind.speed + "m/s, " + data.wind.deg + "°";
    // cloudiness
    console.log("cloudiness " + data.clouds.all + "%");
    retrieve(details, [1, 1]).innerHTML = data.clouds.all + "%";
    // pressure
    console.log("pressure " + data.main.pressure + " hpa");
    retrieve(details, [2, 1]).innerHTML = data.main.pressure + " hpa";
    // humidity
    console.log("humidity " + data.main.humidity + "%");
    retrieve(details, [3, 1]).innerHTML = data.main.humidity + "%";
    // coordinates
    console.log("coordinates " + "[" + data.coord.lat + ", " + data.coord.lon + "]");
    retrieve(details, [4, 1]).innerHTML = "[" + data.coord.lat + ", " + data.coord.lon + "]";
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
    const data = await get_json_data(url);
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

    set_details(details, data);

    loading.style.display = "none";
    brief.style.display = details.style.display = "";
}

async function update_cities_from_local_storage() {
    const cities_li = Array.from(document.getElementsByClassName("cities")[0].children);
    const screen_cities = [];
    cities_li.forEach(li => screen_cities.push(li.querySelector(".information h3").innerHTML));

    let cities = [];
    if (localStorage.getItem("cities") !== null) {
        cities = localStorage.getItem("cities").split(',');
    }
    console.log("cities = " + cities);

    for (const city of cities) {
        if (!screen_cities.includes(city)) {
            const rnd = Math.random().toString();
            const code = await add_new_li(city, rnd);
            if (code === 1) {
                console.warn("for city " + city + " code is " + code);
                document.getElementById(rnd).remove();
            }
        }
    }
    cities = cities.concat(screen_cities);
    localStorage.setItem("cities", cities.toString());
}

async function add_new_li(city, rnd) {
    const t = document.getElementsByTagName("template")[0];
    const clone = t.content.cloneNode(true);
    clone.children[0].id = rnd;
    const clone_info = clone.querySelector(".information");
    clone_info.children[0].innerHTML = city;
    clone_info.children[2].innerHTML = "???°C";
    clone.querySelector(".loading").style.display = "flex";
    clone.querySelector(".details").style.display = "none";

    const ul = document.getElementsByClassName("cities")[0];
    await ul.insertBefore(clone, ul.childNodes[0]);

    const url = url_pref + "q=" + city + "&APIKEY=" + APIkey + "&units=metric";
    const data = await get_json_data(url);

    if ((data.cod - data.cod % 100) / 100 !== 2) {
        return 1;
    }

    const city_li = document.getElementById(rnd);
    const brief_info = city_li.querySelector(".information");
    // brief
    // weather icon
    retrieve(brief_info, [1]).src = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    // temperature
    retrieve(brief_info, [2]).innerHTML = data.main.temp + "°C";

    const details = city_li.querySelector(".details");
    set_details(details, data);

    city_li.querySelector(".loading").style.display = "none";
    details.style.display = "";

    return 0;
}

const reformat_str = str => {
    str = str.toLowerCase();
    return str[0].toUpperCase() + str.slice(1);
}

async function add_new_city(event) {
    const rnd = Math.random().toString();

    console.log(event.target);
    console.log(event.target.children[0]);
    console.log(event.target.children[0].innerHTML);
    console.log(event.target.children[0].textContent);

    const city = reformat_str(event.target.children[0].value);

    let cities = [];
    if (localStorage.getItem("cities") !== null) {
        cities = localStorage.getItem("cities").split(',');
    }
    if (cities.includes(city)) {
        alert("Город '" + city + "' уже находится в списке");
        return
    }

    const code = await add_new_li(city, rnd);
    if (code === 0) {
        cities.push(city);
        localStorage.setItem("cities", cities.toString());
    } else {
        // if (code === 2) {
        //      alert("Город '" + city + "' уже находится в списке");
        // } else {
             alert("Не удаётся найти город '" + city + "'");
        // }

        document.getElementById(rnd).remove();
    }
}

const remove_li = object => {
    const rnd = object.parentElement.parentElement.id;
    const this_city = object.parentElement.querySelector(".information h3").innerHTML;

    document.getElementById(rnd).remove();

    let cities = [];
    if (localStorage.getItem("cities") !== null) {
        cities = localStorage.getItem("cities").split(',');
    }
    cities = cities.filter(city => this_city !== city);
    localStorage.setItem("cities", cities.toString())
}

async function start() {
    await rqst_geo();
    document.getElementById("form").addEventListener("submit", async event => {
        event.preventDefault();
        console.log("event started");
        console.log(event);
        await add_new_city(event);
        event.target.children[0].value = "";
    });
}

window.onload = start;