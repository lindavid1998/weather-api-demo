import './style.css';
import { loadPopularCities } from './load-subheader';
import { loadSearchResult } from './load-search-result';

const convertUnitBtn = document.getElementById('convert-btn');
const searchInput = document.getElementById('city');
const API_KEY = '96982c931916b45bc19ab916987f580b';
let useMetric = false;

window.onload = () => {
  loadPopularCities();
};

convertUnitBtn.addEventListener('click', () => {
  useMetric = !useMetric;
  if (useMetric) {
    convertUnitBtn.innerHTML = `Units: &deg;C`;
  } else {
    convertUnitBtn.innerHTML = `Units: &deg;F`;
  }

  loadPopularCities();
  if (document.querySelector('.city-name').textContent) {
    loadSearchResult(document.querySelector('.city-name').textContent);
  }

});

document.getElementById('search-icon').addEventListener('click', () => {
  loadSearchResult(searchInput.value);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key == 'Enter') {
    loadSearchResult(searchInput.value);
  }
});

export { API_KEY, useMetric };
