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

    let url = url_pref + "lat=" + crd.latitude + "&lon=" + crd.longitude + "&"
}

const error = err => console.warn(`ERROR(${err.code}): ${err.message}`);

// navigator.geolocation.getCurrentPosition(success, error);

const set_header_info = url => {

}