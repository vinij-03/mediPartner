// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-analytics.js";
import {
    getDatabase,
    ref,
    child,
    onValue,
    get,
} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let j = 0
const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};
let curLoc = []

let govB = document.getElementById('gov')
let pvtB = document.getElementById('pvt')
let bedB = document.getElementById('bed')
let ambB = document.getElementById('amb')

govB.addEventListener("change", function () {
    filterData(allData);
});

pvtB.addEventListener("change", function () {
    filterData(allData);
});
ambB.addEventListener("change", function () {
    filterData(allData);
});

function success(pos) {
    const crd = pos.coords;
    curLoc = [crd.latitude, crd.longitude]
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
}

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);
const firebaseConfig = {
    apiKey: "AIzaSyDCElU7BKqjhiZgeHTUNed5WH8X5tfcp2o",
    authDomain: "medipartner-iter.firebaseapp.com",
    projectId: "medipartner-iter",
    storageBucket: "medipartner-iter.appspot.com",
    messagingSenderId: "1010659495362",
    appId: "1:1010659495362:web:a9687db14df425b7565a5b",
    measurementId: "G-EPSX4WTMH3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
let allData

function getData() {
    const hospitalsRef = ref(db, 'hospitals');
    onValue(hospitalsRef, async (snapshot) => {
        const data = await snapshot.val();
        allData = data;
        console.log(allData)
        await navigator.geolocation.getCurrentPosition(success, error, options);
        for (let item in allData) {
            allData[item]['distance'] = await findDistance(curLoc, allData[item]['location'])
            allData[item]['bedStatus'] = allData[item]['bedNum'] == 0 ? 0 : 1
            filteredIdList.push(item)
        }
        console.log(allData)
        filterData(allData)
        viewCards(allData)

    });
}
getData()
async function findDistance(p1, p2) {
    let url = "http://router.project-osrm.org/route/v1/driving/" + p1[1] + "," + p1[0] + ";" + p2[1] + "," + p2[0]
    let response = await (await fetch(url)).json()
    console.log(response['routes'][0]['distance'] + 'm')
    return response['routes'][0]['distance']
}
findDistance([52.517037, 13.388860], [52.529407, 13.397634])
function viewCards(obj) {
    let cardData = ``
    for (let k in filteredIdList) {
        let i = filteredIdList[k]
        cardData = cardData + `<div class="card text-center"
        style="margin-bottom: 50px; margin-top: 50px; margin-right: 50px; margin-left: 50px; border-radius: 1rem;">
        <div class="card-header">`+ obj[i]['distance'] + `m
        </div>
        <div class="card-body">
          <h5 class="card-title">`+ obj[i]['name'] + `</h5>
          <p class="card-text">
          <p>Vacant beds: <span style="color:sky skyblue">`+ obj[i]['bedNum'] + `</span></p>
          Ambulance: <span style="color:`+ (obj[i]['ambulanceStatus'] == 1 ? "green" : "red") + `;">` + (obj[i]['ambulanceStatus'] == 1 ? "Yes" : "No") + `</span>
          </p>
          <a href="tel:`+ obj[i]['emergency'] + `" class="btn btn-primary">Call</a>
        </div>
        <div class="card-footer text-muted">`+ (obj[i]['owner'] == 'gov' ? "Government" : "Private") + `
        </div>
      </div>`
    }
    let container = document.getElementById('cardContainer')
    container.innerHTML = cardData
}
let filteredData = {}
let filteredIdList = []
let sortByDistance = true;
let bedsAvailable = false;
let ambulanceAvailable = false;
let gov = true;
let pvt = true;

function filterData(data) {
    filteredIdList = []
    filteredData = {}
    if (data == null) {
        return
    }
    for (const i in data) {
        if (data[i]["bedNum"] == 0) {
            continue
        }
        if (ambB.checked == true && data[i]["ambulanceStatus"] == 0) {
            continue
        }
        if (!govB.checked && !pvtB.checked) {
            filteredData[i] = data[i]
        }
        if (govB.checked && data[i]["owner"] == "gov") {
            filteredData[i] = data[i]
        }
        if (pvtB.checked && data[i]["owner"] == "pvt") {
            filteredData[i] = data[i]
        }
    }
    console.log(filteredData)
    for (const i in filteredData) {
        filteredIdList.push(i)
    }
    console.log(filteredIdList)

    if (sortByDistance) {
        filteredIdList.sort((a, b) => filteredData[a]['distance'] - filteredData[b]['distance'])
    }
    viewCards(filteredData)
}

filterData(allData)
