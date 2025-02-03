const map = L.map('map').setView([51.480, -2.591], 11);

const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors & CartoDB'
}).addTo(map);

const geoJsonFiles = [
  { year: '2024', path: 'https://AmFa6.github.io/TAF_test/2024_connectscore.geojson' },
  { year: '2023', path: 'https://AmFa6.github.io/TAF_test/2023_connectscore.geojson' },
  { year: '2022', path: 'https://AmFa6.github.io/TAF_test/2022_connectscore.geojson' },
  { year: '2019', path: 'https://AmFa6.github.io/TAF_test/2019_connectscore.geojson' },
  { year: '2023-2024', path: 'https://AmFa6.github.io/TAF_test/2023-2024_connectscore.geojson' },
  { year: '2019-2024', path: 'https://AmFa6.github.io/TAF_test/2019-2024_connectscore.geojson' },
  { year: '2022-2023', path: 'https://AmFa6.github.io/TAF_test/2022-2023_connectscore.geojson' },
  { year: '2019-2023', path: 'https://AmFa6.github.io/TAF_test/2019-2023_connectscore.geojson' }, 
  { year: '2019-2022', path: 'https://AmFa6.github.io/TAF_test/2019-2022_connectscore.geojson' }
];

const layers = {};
let layersLoaded = 0;
const totalLayers = geoJsonFiles.length;

geoJsonFiles.forEach(file => {
  fetch(file.path)
    .then(response => response.json())
    .then(geoJson => {
      layers[file.year] = geoJson;
      layersLoaded++;
      if (layersLoaded === totalLayers) {
        initializeSliders();
        updateSliderRanges();
        updateLayerVisibility();
      }
    })
});

const yearDropdown = document.getElementById("yearDropdown");
geoJsonFiles.forEach(file => {
  const option = document.createElement("option");
  option.value = file.year;
  option.text = file.year;
  yearDropdown.add(option);
});

const purposeDropdown = document.getElementById("purposeDropdown");
const modeDropdown = document.getElementById("modeDropdown");
const opacityFieldDropdown = document.getElementById("opacityFieldDropdown");
const outlineFieldDropdown = document.getElementById("outlineFieldDropdown");
yearDropdown.value = "";
opacityFieldDropdown.value = "None";
outlineFieldDropdown.value = "None";

let autoUpdateOpacity = true;
let autoUpdateOutline = true;
let opacityOrder = 'low-to-high';
let outlineOrder = 'low-to-high';

let opacityRangeSlider;
let outlineRangeSlider;

function initializeSliders() {
  opacityRangeSlider = document.getElementById('opacityRangeSlider');
  noUiSlider.create(opacityRangeSlider, {
    start: [0, 0],
    connect: [true, true, true],
    range: {
      'min': 0,
      'max': 0
    },
    step: 1,
    tooltips: false,
    format: {
      to: value => parseFloat(value).toFixed(2), 
      from: value => parseFloat(value)
    }
  });

  const handles = opacityRangeSlider.querySelectorAll('.noUi-handle');
  if (handles.length > 0) {
    handles[0].classList.add('noUi-handle-transparent');
  }

  const connectElements = opacityRangeSlider.querySelectorAll('.noUi-connect');
  if (connectElements.length > 2) {
    connectElements[1].classList.add('noUi-connect-gradient-right');
    connectElements[2].classList.add('noUi-connect-dark-grey');
  }

  outlineRangeSlider = document.getElementById('outlineRangeSlider');
  noUiSlider.create(outlineRangeSlider, {
    start: [0, 0],
    connect: [true, true, true],
    range: {
      'min': 0,
      'max': 0
    },
    step: 1,
    tooltips: false,
    format: {
      to: value => parseFloat(value).toFixed(2),
      from: value => parseFloat(value)
    }
  });

  const outlineHandles = outlineRangeSlider.querySelectorAll('.noUi-handle');
  if (outlineHandles.length > 0) {
    outlineHandles[0].classList.add('noUi-handle-transparent');
  }

  const outlineConnectElements = outlineRangeSlider.querySelectorAll('.noUi-connect');
  if (outlineConnectElements.length > 1) {
    outlineConnectElements[1].classList.add('noUi-connect-gradient-right');
    outlineConnectElements[2].classList.add('noUi-connect-dark-grey');
  }

  opacityRangeSlider.noUiSlider.on('update', updateLayerVisibility);
  outlineRangeSlider.noUiSlider.on('update', updateLayerVisibility);

  opacityRangeSlider.noUiSlider.on('update', function(values, handle) {
    const handleElement = handles[handle];
    handleElement.setAttribute('data-value', formatValue(values[handle], opacityRangeSlider.noUiSlider.options.step));
  });
  
  outlineRangeSlider.noUiSlider.on('update', function(values, handle) {
    const handleElement = outlineHandles[handle];
    handleElement.setAttribute('data-value', formatValue(values[handle], outlineRangeSlider.noUiSlider.options.step));
  });
}

let isInverseOpacity = false;
let isInverseOutline = false;

function toggleInverseOpacityScale() {
  isInverseOpacity = !isInverseOpacity;
  const handles = opacityRangeSlider.querySelectorAll('.noUi-handle');
  const connectElements = opacityRangeSlider.querySelectorAll('.noUi-connect');

  if (isInverseOpacity) {
    opacityRangeSlider.noUiSlider.updateOptions({
      connect: [true, true, true]
    });
    handles[1].classList.add('noUi-handle-transparent');
    handles[0].classList.remove('noUi-handle-transparent');
    connectElements[0].classList.add('noUi-connect-dark-grey');
    connectElements[1].classList.remove('noUi-connect-gradient-right');
    connectElements[1].classList.add('noUi-connect-gradient-left');
    connectElements[2].classList.remove('noUi-connect-dark-grey');
  } else {
    opacityRangeSlider.noUiSlider.updateOptions({
      connect: [true, true, true]
    });
    handles[1].classList.remove('noUi-handle-transparent');
    handles[0].classList.add('noUi-handle-transparent');
    connectElements[0].classList.remove('noUi-connect-dark-grey');
    connectElements[1].classList.remove('noUi-connect-gradient-left');
    connectElements[1].classList.add('noUi-connect-gradient-right');
    connectElements[2].classList.add('noUi-connect-dark-grey');
  }
  updateLayerVisibility();
}

function toggleInverseOutlineScale() {
  isInverseOutline = !isInverseOutline;
  const handles = outlineRangeSlider.querySelectorAll('.noUi-handle');
  const connectElements = outlineRangeSlider.querySelectorAll('.noUi-connect');

  if (isInverseOutline) {
    outlineRangeSlider.noUiSlider.updateOptions({
      connect: [true, true, true]
    });
    handles[1].classList.add('noUi-handle-transparent');
    handles[0].classList.remove('noUi-handle-transparent');
    connectElements[0].classList.add('noUi-connect-dark-grey');
    connectElements[1].classList.remove('noUi-connect-gradient-right');
    connectElements[1].classList.add('noUi-connect-gradient-left');
    connectElements[2].classList.remove('noUi-connect-dark-grey');
  } else {
    outlineRangeSlider.noUiSlider.updateOptions({
      connect: [true, true, true]
    });
    handles[1].classList.remove('noUi-handle-transparent');
    handles[0].classList.add('noUi-handle-transparent');
    connectElements[0].classList.remove('noUi-connect-dark-grey');
    connectElements[1].classList.remove('noUi-connect-gradient-left');
    connectElements[1].classList.add('noUi-connect-gradient-right');
    connectElements[2].classList.add('noUi-connect-dark-grey');
  }
  updateLayerVisibility();
}

document.getElementById('inverseOpacityScaleButton').addEventListener('click', toggleInverseOpacityScale);
document.getElementById('inverseOutlineScaleButton').addEventListener('click', toggleInverseOutlineScale);

function formatValue(value, step) {
  if (step >= 1) {
    return parseFloat(value).toFixed(0);
  } else if (step >= 0.1) {
    return parseFloat(value).toFixed(1);
  } else if (step >= 0.01) {
    return parseFloat(value).toFixed(2);
  } else {
    return value.toString();
  }
}

function updateSliderRanges() {
  const opacityField = opacityFieldDropdown.value;
  const outlineField = outlineFieldDropdown.value;

  const selectedYear = yearDropdown.value;
  const selectedLayer = layers[selectedYear];

  if (selectedLayer) {
    const opacityValues = opacityField !== "None" ? selectedLayer.features.map(feature => feature.properties[opacityField]).filter(value => value !== null && value !== 0) : [];
    const outlineValues = outlineField !== "None" ? selectedLayer.features.map(feature => feature.properties[outlineField]).filter(value => value !== null && value !== 0) : [];

    const minOpacity = Math.min(...opacityValues);
    const maxOpacity = Math.max(...opacityValues);
    const minOutline = Math.min(...outlineValues);
    const maxOutline = Math.max(...outlineValues);

    const roundedMaxOpacity = Math.pow(10, Math.ceil(Math.log10(maxOpacity)));
    const roundedMaxOutline = Math.pow(10, Math.ceil(Math.log10(maxOutline)));

    let opacityStep = roundedMaxOpacity / 100;
    let outlineStep = roundedMaxOutline / 100;

    if (isNaN(opacityStep) || opacityStep <= 0) {
      opacityStep = 1;
    }
    if (isNaN(outlineStep) || outlineStep <= 0) {
      outlineStep = 1;
    }

    const adjustedMaxOpacity = Math.ceil(maxOpacity / opacityStep) * opacityStep;
    const adjustedMinOpacity = Math.floor(minOpacity / opacityStep) * opacityStep;
    const adjustedMaxOutline = Math.ceil(maxOutline / outlineStep) * outlineStep;
    const adjustedMinOutline = Math.floor(minOutline / outlineStep) * outlineStep;

    if (opacityField === "None") {
      opacityRangeSlider.setAttribute('disabled', true);
      opacityRangeSlider.noUiSlider.updateOptions({
        range: {
          'min': 0,
          'max': 0
        },
        step: 1
      });
      opacityRangeSlider.noUiSlider.set(['', '']);
      document.getElementById('opacityRangeMin').innerText = '';
      document.getElementById('opacityRangeMax').innerText = '';
    } else {
      opacityRangeSlider.removeAttribute('disabled');
      opacityRangeSlider.noUiSlider.updateOptions({
        range: {
          'min': adjustedMinOpacity,
          'max': adjustedMaxOpacity
        },
        step: opacityStep
      });
      opacityRangeSlider.noUiSlider.set([adjustedMinOpacity, adjustedMaxOpacity]);
      document.getElementById('opacityRangeMin').innerText = formatValue(adjustedMinOpacity, opacityStep);
      document.getElementById('opacityRangeMax').innerText = formatValue(adjustedMaxOpacity, opacityStep);
    }
    if (outlineField === "None") {
      outlineRangeSlider.setAttribute('disabled', true);
      outlineRangeSlider.noUiSlider.updateOptions({
        range: {
          'min': 0,
          'max': 0
        },
        step: 1
      });
      outlineRangeSlider.noUiSlider.set(['', '']);
      document.getElementById('outlineRangeMin').innerText = '';
      document.getElementById('outlineRangeMax').innerText = '';
    } else {
      outlineRangeSlider.removeAttribute('disabled');
      outlineRangeSlider.noUiSlider.updateOptions({
        range: {
          'min': adjustedMinOutline,
          'max': adjustedMaxOutline
        },
        step: parseFloat(outlineStep.toFixed(1))
      });
      outlineRangeSlider.noUiSlider.set([adjustedMinOutline, adjustedMaxOutline]);
      document.getElementById('outlineRangeMin').innerText = formatValue(adjustedMinOutline, outlineStep);
      document.getElementById('outlineRangeMax').innerText = formatValue(adjustedMaxOutline, outlineStep);
    }
  } else {
  }
}

function updateLayerVisibility() {
  const selectedYear = yearDropdown.value;
  if (!selectedYear) {
    return;
  }
  const selectedPurpose = purposeDropdown.value;
  const selectedMode = modeDropdown.value;
  const opacityField = opacityFieldDropdown.value;
  const outlineField = outlineFieldDropdown.value;

  map.eachLayer(layer => {
    if (layer !== baseLayer) {
      map.removeLayer(layer);
    }
  });

  const fieldToDisplay = selectedYear.includes('-') ? `${selectedPurpose}_${selectedMode}` : `${selectedPurpose}_${selectedMode}_100`;
  const selectedLayer = layers[selectedYear];

  if (selectedLayer) {
    const filteredFeatures = selectedLayer.features.filter(feature => {
      const value = feature.properties[fieldToDisplay];
      return feature.properties[fieldToDisplay] !== undefined && isClassVisible(value, selectedYear);
    });

    let minOpacity = parseFloat(opacityRangeSlider.noUiSlider.get()[0]);
    let maxOpacity = parseFloat(opacityRangeSlider.noUiSlider.get()[1]);
    let minOutline = parseFloat(outlineRangeSlider.noUiSlider.get()[0]);
    let maxOutline = parseFloat(outlineRangeSlider.noUiSlider.get()[1]);

    const filteredGeoJson = {
      type: "FeatureCollection",
      features: filteredFeatures
    };

    const geoJsonLayer = L.geoJSON(filteredGeoJson, {
      style: feature => styleFeature(feature, fieldToDisplay, opacityField, outlineField, minOpacity, maxOpacity, minOutline, maxOutline, selectedYear),
      onEachFeature: (feature, layer) => onEachFeature(feature, layer, selectedYear)
    }).addTo(map);
  }

  updateLegend();
}

function onEachFeature(feature, layer, selectedYear) {
  layer.on({
    click: function (e) {
      const properties = feature.properties;
      const getValue = (prop) => (properties[prop] !== undefined && properties[prop] !== null) ? properties[prop] : '-';
      const hexId = getValue('Hex_ID');
      const scoreValue = getValue(`${selectedPurpose}_${selectedMode}`);
      let score = '-';
      let scoreLabel = 'Score';

      if (scoreValue !== '-') {
        if (selectedYear.includes('-')) {
          score = Math.round(scoreValue * 100) + '%';
          scoreLabel = 'Score Difference';
        } else {
          score = Math.round(scoreValue);
        }
      }
      
      const percentile = getValue(`${selectedPurpose}_${selectedMode}_100`) !== '-' ? Math.round(getValue(`${selectedPurpose}_${selectedMode}_100`)) : '-';
      const population = getValue('pop') !== '-' ? Math.round(getValue('pop')) : '-';
      const imd = population === 0 ? '-' : (getValue('imd') !== '-' ? getValue('imd').toFixed(2) : '-');
      const carAvailability = population === 0 ? '-' : (getValue('carav') !== '-' ? getValue('carav').toFixed(2) : '-');
      const futureDwellings = getValue('hh_fut') === 0 ? '-' : (getValue('hh_fut') !== '-' ? Math.round(getValue('hh_fut')) : '-');
      
      let popupContent = `<strong>Hex_ID:</strong> ${hexId}<br><strong>${scoreLabel}:</strong> ${score}<br><strong>Percentile:</strong> ${percentile}<br><strong>Population:</strong> ${population}<br><strong>IMD:</strong> ${imd}<br><strong>Car Availability:</strong> ${carAvailability}<br><strong>Future Dwellings:</strong> ${futureDwellings}`;
      
      L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);
    }
  });
}

function getColor(value, selectedYear) {
  if (!selectedYear) {
    return 'transparent';
  }

  if (selectedYear.includes('-')) {
    if (value <= -0.2) {
      return '#FF0000';
    } else if (value > -0.2 && value <= -0.1) {
      return '#FF5500';
    } else if (value > -0.1 && value < 0) {
      return '#FFAA00'; 
    } else if (value === 0) {
      return 'transparent';
    } else if (value > 0 && value <= 0.1) {
      return '#B0E200';
    } else if (value >= 0.1 && value < 0.2) {
      return '#6EC500';
    } else {
      return '#38A800'; 
    }
  } else {
    return value > 90 ? '#fde725' :
           value > 80 ? '#b5de2b' :
           value > 70 ? '#6ece58' :
           value > 60 ? '#35b779' :
           value > 50 ? '#1f9e89' :
           value > 40 ? '#26828e' :
           value > 30 ? '#31688e' :
           value > 20 ? '#3e4989' :
           value > 10 ? '#482777' :
                        '#440154';
  }
}

function isClassVisible(value, selectedYear) {
  const legendCheckboxes = document.querySelectorAll('.legend-checkbox');
  for (const checkbox of legendCheckboxes) {
    const range = checkbox.getAttribute('data-range');
    const isChecked = checkbox.checked;
    if (selectedYear.includes('-')) {
      const [min, max] = range.split(' to ').map(parseFloat);
      if (value >= min && value <= max && !isChecked) {
        return false;
      }
    } else {
      const [min, max] = range.split('-').map(parseFloat);
      if (value >= min && value <= max && !isChecked) {
        return false;
      }
    }
  }
  return true;
}

function updateLegend() {
  const selectedYear = yearDropdown.value;
  const legendContent = document.getElementById("legend-content");

  const checkboxStates = {};
  const legendCheckboxes = document.querySelectorAll('.legend-checkbox');
  legendCheckboxes.forEach(checkbox => {
    checkboxStates[checkbox.getAttribute('data-range')] = checkbox.checked;
  });

  legendContent.innerHTML = '';

  const headerText = selectedYear.includes('-') ? "Score Difference" : "Population Percentiles";
  const headerDiv = document.createElement("div");
  headerDiv.innerHTML = `${headerText}`;
  headerDiv.style.fontSize = "1.1em";
  headerDiv.style.marginBottom = "10px";
  legendContent.appendChild(headerDiv);

  const masterCheckboxDiv = document.createElement("div");
  masterCheckboxDiv.innerHTML = `<input type="checkbox" id="masterCheckbox" checked> <i>Select/Deselect All</i>`;
  legendContent.appendChild(masterCheckboxDiv);

  const classes = selectedYear.includes('-') ? [
    { range: `<= -20%`, color: "#FF0000" },
    { range: `> -20% and <= -10%`, color: "#FF5500" },
    { range: `> -10% and < 0`, color: "#FFAA00" },
    { range: `= 0`, color: "transparent" },
    { range: `> 0 and <= 10%`, color: "#B0E200" },
    { range: `>= 10% and < 20%`, color: "#6EC500" },
    { range: `>= 20%`, color: "#38A800" }
  ] : [
    { range: `90-100 - 10% of region's population with best access to amenities`, color: "#fde725" },
    { range: `80-90`, color: "#b5de2b" },
    { range: `70-80`, color: "#6ece58" },
    { range: `60-70`, color: "#35b779" },
    { range: `50-60`, color: "#1f9e89" },
    { range: `40-50`, color: "#26828e" },
    { range: `30-40`, color: "#31688e" },
    { range: `20-30`, color: "#3e4989" },
    { range: `10-20`, color: "#482777" },
    { range: `0-10 - 10% of region's population with worst access to amenities`, color: "#440154" }
  ];

  classes.forEach(c => {
    const div = document.createElement("div");
    const isChecked = checkboxStates[c.range] !== undefined ? checkboxStates[c.range] : true;
    div.innerHTML = `<input type="checkbox" class="legend-checkbox" data-range="${c.range}" ${isChecked ? 'checked' : ''}> <span style="display: inline-block; width: 20px; height: 20px; background-color: ${c.color};"></span> ${c.range}`;
    legendContent.appendChild(div);
  });

  const newLegendCheckboxes = document.querySelectorAll('.legend-checkbox');
  newLegendCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateMasterCheckbox();
      updateLayerVisibility();
    });
  });

  const masterCheckbox = document.getElementById('masterCheckbox');
  masterCheckbox.addEventListener('change', () => {
    const isChecked = masterCheckbox.checked;
    newLegendCheckboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
    });
    updateLayerVisibility();
  });

  updateMasterCheckbox();
}

function updateMasterCheckbox() {
  const newLegendCheckboxes = document.querySelectorAll('.legend-checkbox');
  const allChecked = Array.from(newLegendCheckboxes).every(checkbox => checkbox.checked);
  const noneChecked = Array.from(newLegendCheckboxes).every(checkbox => !checkbox.checked);
  const masterCheckbox = document.getElementById('masterCheckbox');
  masterCheckbox.checked = allChecked;
  masterCheckbox.indeterminate = !allChecked && !noneChecked;
}

function inverseOpacityScale() {
  opacityOrder = opacityOrder === 'low-to-high' ? 'high-to-low' : 'low-to-high';
  updateLayerVisibility();
}

function inverseOutlineScale() {
  outlineOrder = outlineOrder === 'low-to-high' ? 'high-to-low' : 'low-to-high';
  updateLayerVisibility();
}

const inverseOpacityScaleButton = document.getElementById("inverseOpacityScaleButton");
inverseOpacityScaleButton.addEventListener("click", inverseOpacityScale);

const inverseOutlineScaleButton = document.getElementById("inverseOutlineScaleButton");
inverseOutlineScaleButton.addEventListener("click", inverseOutlineScale);

yearDropdown.addEventListener("change", () => {
  updateSliderRanges();
  updateLayerVisibility();
});
purposeDropdown.addEventListener("change", updateLayerVisibility);
modeDropdown.addEventListener("change", updateLayerVisibility);
opacityFieldDropdown.addEventListener("change", () => {
  autoUpdateOpacity = true;
  updateSliderRanges();
  updateLayerVisibility();
});
outlineFieldDropdown.addEventListener("change", () => {
  autoUpdateOutline = true;
  updateSliderRanges();
  updateLayerVisibility();
});

function styleFeature(feature, fieldToDisplay, opacityField, outlineField, minOpacityValue, maxOpacityValue, minOutlineValue, maxOutlineValue, selectedYear) {
  const value = feature.properties[fieldToDisplay];
  const color = getColor(value, selectedYear);

  let opacity;
  if (opacityField === 'None') {
    opacity = 0.8;
  } else {
    const opacityValue = feature.properties[opacityField];
    if (opacityValue === 0 || opacityValue === null) {
      opacity = isInverseOpacity ? 0.8 : 0.1;
    } else {
      opacity = scaleExp(opacityValue, minOpacityValue, maxOpacityValue, 0.1, 0.8, opacityOrder);
    }
  }

  let weight;
  if (outlineField === 'None') {
    weight = 0;
  } else {
    const outlineValue = feature.properties[outlineField];
    if (outlineValue === 0 || outlineValue === null) {
      weight = isInverseOutline ? 4 : 0;
    } else {
      weight = scaleExp(outlineValue, minOutlineValue, maxOutlineValue, 0, 4, outlineOrder);
    }
  }

  return {
    fillColor: color,
    weight: weight,
    opacity: 1,
    color: 'black',
    fillOpacity: opacity
  };
}

function scaleExp(value, minVal, maxVal, minScale, maxScale, order) {
    if (value <= minVal) return order === 'low-to-high' ? minScale : maxScale;
    if (value >= maxVal) return order === 'low-to-high' ? maxScale : minScale;
    const normalizedValue = (value - minVal) / (maxVal - minVal);
    const scaledValue = order === 'low-to-high' ? normalizedValue : 1 - normalizedValue;
    return minScale + scaledValue * (maxScale - minScale);
}

const amenitiesCheckboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]');
const yearSelector = document.querySelector('#yearDropdownAmenities'); // Corrected ID

document.addEventListener('DOMContentLoaded', (event) => {
  const drawMapButton = document.getElementById('drawMapButton');
  drawMapButton.addEventListener('click', updateAmenitiesLayer);
});

function updateAmenitiesLayer() {
  console.log("Draw Map button clicked"); // Debug log
  const selectedAmenities = Array.from(amenitiesCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);

  console.log("Selected Amenities:", selectedAmenities); // Debug log

  const selectedYear = yearSelector.value; // Get the selected year
  const selectedMode = document.querySelector('#modeDropdownAmenities').value; // Get the selected mode

  console.log("Selected Year:", selectedYear); // Debug log
  console.log("Selected Mode:", selectedMode); // Debug log

  if (selectedAmenities.length === 0) {
    map.eachLayer(layer => {
      if (layer.feature && layer.feature.properties.Hex_ID) {
        map.removeLayer(layer);
      }
    });
    return;
  }

  const selectedAmenity = selectedAmenities[0]; // Assuming only one amenity is selected at a time
  const csvPath = `https://AmFa6.github.io/TAF_test/${selectedYear}_${selectedAmenity}_csv.csv`;

  console.log("CSV Path:", csvPath); // Debug log

  fetch(csvPath)
    .then(response => response.text())
    .then(csvText => {
      const csvData = Papa.parse(csvText, { header: true }).data;
      const hexTimeMap = {};

      csvData.forEach(row => {
        if (row.Mode === selectedMode) { // Filter by mode
          const hexId = row.OriginName; // Use OriginName instead of Hex_ID
          const time = parseFloat(row.Time);
          if (!hexTimeMap[hexId] || time < hexTimeMap[hexId]) {
            hexTimeMap[hexId] = time;
          }
        }
      });

      console.log("Hex Time Map:", hexTimeMap); // Debug log

      fetch('https://AmFa6.github.io/TAF_test/HexesSocioEco.geojson')
        .then(response => response.json())
        .then(geoJson => {
          console.log("GeoJSON Data:", geoJson); // Debug log
          const geoJsonLayer = L.geoJSON(geoJson, {
            style: feature => {
              const hexId = feature.properties.Hex_ID;
              const time = hexTimeMap[hexId];
              let color = 'transparent';

              if (time !== undefined) {
                if (time <= 5) color = '#fde725';
                else if (time <= 10) color = '#7ad151';
                else if (time <= 15) color = '#23a884';
                else if (time <= 20) color = '#2a788e';
                else if (time <= 25) color = '#414387';
                else if (time <= 30) color = '#440154';
              }

              console.log(`Hex_ID: ${hexId}, Time: ${time}, Color: ${color}`); // Debug log

              return {
                fillColor: color,
                weight: 1,
                opacity: 1,
                color: 'black',
                fillOpacity: 0.7
              };
            },
            onEachFeature: (feature, layer) => {
              layer.on({
                click: function (e) {
                  // Handle click event if needed
                }
              });
            }
          });

          console.log("Adding GeoJSON Layer to Map"); // Debug log
          geoJsonLayer.addTo(map);
        });
    });
}
