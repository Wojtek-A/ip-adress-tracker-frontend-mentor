import axios from 'axios';
const infoListItems = document.querySelectorAll('.info-list-item__text');
const input = document.querySelector('.search__input');
const searchButton = document.querySelector('.search__button');
let clientIp = '';
let map = null;

fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(data => {
    clientIp = Object.values(data)[0];
    return clientIp;
  });

async function getData(x, y) {
  const apiKey = process.env.GEO_API_KEY;

  try {
    const response = await axios.get(
      `https://geo.ipify.org/api/v2/country,city?apiKey=${apiKey}&${x}=${y}`
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error(error);
  }
}

const putInfo = (x, y) => {
  getData(x, y).then(data => {
    infoListItems[0].innerHTML = `${data.ip}`;
    infoListItems[1].innerHTML = `${data.location.city}, ${data.location.country}`;
    infoListItems[2].innerHTML = `UTC ${data.location.timezone}`;
    infoListItems[3].innerHTML = `${data.isp}`;

    const getMap = (lat, lng) => {
      map = L.map('map').setView([`${lat}`, `${lng}`], 16);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // const myIcon = L.icon({
      //   iconUrl: '../images/marker.png',
      //   iconSize: [38, 95],
      // });

      // L.marker([`${lat}`, `${lng}`], { icon: myIcon }).addTo(map);

      L.marker([`${lat}`, `${lng}`]).addTo(map);
    };

    if (map !== null) {
      map.remove();
      getMap(data.location.lat, data.location.lng);
    } else getMap(data.location.lat, data.location.lng);
  });
};

putInfo('ipAddress', clientIp);

const newInfo = e => {
  e.preventDefault();
  const data = input.value;
  let domainRegExr = new RegExp(
    /^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/
  );
  let ipRegExr = new RegExp(
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
  );

  if (domainRegExr.test(data) == true) {
    putInfo('domain', data);
  } else if (ipRegExr.test(data) == true) {
    putInfo('ipAddress', data);
  } else {
    alert('Something went wrong. Is the IP address or domain correct?');
  }
};

searchButton.addEventListener('click', newInfo);
