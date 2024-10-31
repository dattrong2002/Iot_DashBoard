async function fetchLedStastic(page) {
    try {
        const response = await fetch(`http://localhost:5000/api/led_stastic?page=${page}&limit=${sensorLimit}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        updateLedTables(data.ledData);  
        updateLedPagination(data.totalPages, data.currentPage);
        currentLedPage = data.currentPage;
    } catch (error) {
        console.error('Error fetching LED data:', error);
    }
}

function updateLedTables(ledData) {
    const ledTableBody = document.getElementById('ledData');  
    ledTableBody.innerHTML = '';
    ledData.forEach(led => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${led.ID}</td>
            <td>${led.Device}</td>
            <td>${led.Status}</td>
            <td>${led.timestamp}</td>
        `;
        ledTableBody.appendChild(row);
    });
}


function updateLedPagination(totalPages, currentPage) {
    const paginationDiv = document.getElementById('led-pagination');
    paginationDiv.innerHTML = '';  

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => fetchLedStastic(currentPage - 1));
    paginationDiv.appendChild(prevButton);


    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = (i === currentPage) ? 'active' : '';
        pageButton.addEventListener('click', () => fetchLedStastic(i));
        paginationDiv.appendChild(pageButton);
    }

    // Tạo nút 'Next'
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => fetchLedStastic(currentPage + 1));
    paginationDiv.appendChild(nextButton);
}

let allowFetchLed = true;
let allowFetchSensor = true;
let currentSensorPage = 1;  
let currentLedPage = 1;  
const sensorLimit = 10;  
async function fetchSensorStastic(page) {
    try {
        const response = await fetch(`http://localhost:5000/api/sensor_stastic?page=${page}&limit=${sensorLimit}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        updateSensorTable(data.sensorData);
        updateSensorPagination(data.totalPages, data.currentPage);
        currentSensorPage = data.currentPage;
    } catch (error) {
        console.error('Error fetching sensor data:', error);
    }
}

function updateSensorTable(sensorData) {
    const sensorTableBody = document.getElementById('sensorData');
    sensorTableBody.innerHTML = '';

     sensorData.forEach((sensor) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sensor.id}</td>
            <td>${sensor.temperature}°C</td>
            <td>${sensor.humidity}%</td>
            <td>${sensor.light}lux</td>
            <td>${sensor.dust}%</td>
            <td>${sensor.timestamp}</td>

        `;
        sensorTableBody.appendChild(row);
    });
}
function updateSensorPagination(totalPages, currentPage) {
    const paginationDiv = document.getElementById('sensor-pagination');
    paginationDiv.innerHTML = '';  

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => fetchSensorStastic(currentPage - 1));
    paginationDiv.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = (i === currentPage) ? 'active' : '';
        pageButton.addEventListener('click', () => fetchSensorStastic(i));
        paginationDiv.appendChild(pageButton);
    }

    // Tạo nút 'Next'
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => fetchSensorStastic(currentPage + 1));
    paginationDiv.appendChild(nextButton);
}
function updateSensorSearchPagination(totalPages, currentPage) {
    const paginationDiv = document.getElementById('sensor-pagination');
    paginationDiv.innerHTML = '';  
    
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => fetchFilteredSensor(currentPage - 1));
    paginationDiv.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = (i === currentPage) ? 'active' : '';
        pageButton.addEventListener('click', () => fetchFilteredSensor(i));
        paginationDiv.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => fetchFilteredSensor(currentPage + 1));
    paginationDiv.appendChild(nextButton);
}
function updateLedSearchPagination(totalPages, currentPage) {
    const paginationDiv = document.getElementById('led-pagination');
    paginationDiv.innerHTML = '';  
    
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => fetchFilteredLed(currentPage - 1));
    paginationDiv.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = (i === currentPage) ? 'active' : '';
        pageButton.addEventListener('click', () => fetchFilteredLed(i));
        paginationDiv.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => fetchFilteredLed(currentPage + 1));
    paginationDiv.appendChild(nextButton);
}
document.getElementById('filterButton').addEventListener('click', fetchFilteredSensor);

async function fetchFilteredSensor(page) {
    const timestamp = document.getElementById('timestamp1').value; // Lấy giá trị thời gian từ ô input    
    allowFetchSensor = false;
    try {
        const response = await fetch(`http://localhost:5000/api/sensor_data_search?timestamp=${encodeURIComponent(timestamp)}&page=${page}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.sensorData) {
            updateSensorTable([data.sensorData]);  // Cập nhật bảng với dữ liệu bản ghi tìm thấy
        } else {
            console.warn('No data found for the specified timestamp');
            updateSensorTable([]);  // Nếu không có dữ liệu, xóa bảng
        }

        updateSensorSearchPagination(1, 1); // Cập nhật phân trang cho tìm kiếm (một trang)
        currentSensorPage = 1;

    } catch (error) {
        console.error('Error fetching filtered sensor data:', error);
    }
}

document.getElementById('led_filterbutton').addEventListener('click', fetchFilteredLed);
async function fetchFilteredLed(page) {
    const timestamp = document.getElementById('timestamp2').value; // Chỉ cần một timestamp duy nhất

    allowFetchLed = false;

    const queryParams = new URLSearchParams({
        timestamp: timestamp // Sử dụng timestamp
    }).toString();

    try {
        const response = await fetch(`http://localhost:5000/api/led_data_search?${queryParams}&page=${page}&limit=${sensorLimit}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        updateLedTables(data.ledData);  
        updateLedSearchPagination(data.totalPages, data.currentPage);
        currentSensorPage = data.currentPage
    } catch (error) {
        console.error('Error filtering LED data:', error);
    }
}


function resetSensorSearch() {
    document.getElementById('timestamp1').value = '';
    allowFetchSensor = true;  
    fetchSensorStastic(1);
}
function resetLedSearch() {
    document.getElementById('timestamp2').value = '';
    allowFetchLed = true;  // Cho phép gọi lại fetchLedStastic
    fetchLedStastic(1);
}

// Gắn sự kiện cho nút xóa tìm kiếm
document.getElementById('backButton').addEventListener('click', resetSensorSearch);
document.getElementById('backButton2').addEventListener('click', resetLedSearch);

fetchSensorStastic(currentSensorPage);
fetchLedStastic(currentLedPage);
setInterval(() => {
    if (allowFetchSensor) {
        fetchSensorStastic(currentSensorPage); 
    }
}, 10000);
setInterval(() => {
    if (allowFetchLed) {
        fetchLedStastic(currentLedPage); 
    } 
}, 5000);
