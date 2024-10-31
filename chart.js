let myChart1, myChart2; 
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('myChart1').getContext('2d');
    myChart1 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '','',''],
            datasets: [
                {
                    label: 'Temperature',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#ff7782',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Humidity',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: 'rgb(56, 183, 238)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Light',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: 'blue',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    const ct = document.getElementById('myChart2').getContext('2d');
    myChart2 = new Chart(ct, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '','',''],
            datasets: [
                {
                    label: 'Dust',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: 'black',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const mqttClient = new Paho.MQTT.Client('192.168.110.225', 8080, 'clientId' + new Date().getTime());
    mqttClient.connect({
        userName: 'dattrong2002',
        password: '123',
        onSuccess: function() {
            console.log("Connected to MQTT Broker");
            
        },
        onFailure: function(responseObject) {
            console.error("Connection failed: " + responseObject.errorMessage);
        }
    });
    function publishMessage(ledStatus) {
        const message = new Paho.MQTT.Message(JSON.stringify(ledStatus)); 
        message.destinationName = "led"; 
        mqttClient.send(message);
        console.log("Message to topic " + "led" + " is sent: ", ledStatus);
    }
    const lights = document.querySelectorAll('.toggle-light');
    const switchStatuses = document.querySelectorAll('.switch-status');
    const lightBulbs = document.querySelectorAll('.light-bulb');

    lights.forEach((toggleSwitch, index) => {
        toggleSwitch.addEventListener('change', async function(event) {
            if (switchStatuses[index] && lightBulbs[index]) {
                const id = event.target.id
                const status = this.checked ? 'ON' : 'OFF';
                switchStatuses[index].textContent = status;
                lightBulbs[index].src = this.checked ? 
                    'https://img.icons8.com/ios-filled/50/000000/light-on.png' : 
                    'https://img.icons8.com/ios-filled/50/000000/light-off.png';
    
                const ledStatus = {
                    [`led${index + 1}`]: this.checked ? 'on' : 'off'
                };
                publishMessage(ledStatus);
            } else {
                console.error("Switch status or light bulb not found for index:", index);
            }
        });
    });
    
    const toggleFan = document.getElementById('toggle-fan');
    const switchStatusFan = document.getElementById('switch-status-fan');
    const fanIcon = document.getElementById('fan-icon');

    toggleFan.addEventListener('change', function() {
        if (this.checked) {
            switchStatusFan.textContent = 'ON';
            fanIcon.style.animation = 'spin 2s linear infinite';
        } else {
            switchStatusFan.textContent = 'OFF';
            fanIcon.style.animation = 'none'; 
        }
    });

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});

let timeIndex1 = 0;
let timeIndex2 = 0;

const maxDataPoints = 7; 

function updateChart1(newTemperature, newHumidity, newLight) {
    if (timeIndex1 >= maxDataPoints) {
        myChart1.data.datasets[0].data = [0, 0, 0, 0, 0, 0, 0]; 
        myChart1.data.datasets[1].data = [0, 0, 0, 0, 0, 0, 0]; 
        myChart1.data.datasets[2].data = [0, 0, 0, 0, 0, 0, 0]; 
        myChart1.data.labels = ['', '', '', '', '','','']; 
        timeIndex1 = 0; 
    }

    const currentTime = new Date().toLocaleTimeString(); 

    myChart1.data.labels[timeIndex1] = currentTime;

    myChart1.data.datasets[0].data[timeIndex1] = newTemperature;  
    myChart1.data.datasets[1].data[timeIndex1] = newHumidity;  
    myChart1.data.datasets[2].data[timeIndex1] = newLight;         

    timeIndex1++;

    myChart1.update();
}
function updateChart2(newLDust) {
    if (timeIndex2 >= maxDataPoints) {
        myChart2.data.datasets[0].data = [0, 0, 0, 0, 0, 0, 0]; 
        myChart2.data.labels = ['', '', '', '', '','','']; 
        timeIndex2 = 0; 
    }

    const currentTime = new Date().toLocaleTimeString(); 
    myChart2.data.labels[timeIndex2] = currentTime;
    myChart2.data.datasets[0].data[timeIndex2] = newLDust;  
    timeIndex2++;
    myChart2.update();
}
    
    function fetchSensorData() {
        fetch('http://192.168.110.225:5000/api/sensor-data', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data fetched from backend:', data);
            if (data) {
                temperatureString = data.temperature + "C";
                humidityString = data.humidity + "%";
                lightString = data.light + "lux";
                dustString = data.dust + "%";
                document.getElementById("temperature").innerText = temperatureString;
                document.getElementById("humidity").innerText = humidityString;
                document.getElementById("light").innerText = lightString;
                document.getElementById("dust").innerText = dustString;

                const newTemperature = parseFloat(data.temperature);
                const newHumidity = parseFloat(data.humidity);
                const newLight = parseFloat(data.light);
                const newLDust = parseFloat(data.dust);
 

                updateChart1(newTemperature, newHumidity, newLight);
                updateChart2(newLDust);
                
            }
        })
        .catch((error) => {
            console.error('Error fetching data from backend:', error);
        });
}

window.onload = function() {
    fetchSensorData();
    setInterval(fetchSensorData, 10000);
};

async function fetchLed3Status() {
    try {
        const response = await fetch('http://localhost:5000/api/led3_status');
        const data = await response.json();

        if (data.status === 'on') {
            document.getElementById('warning-icon').src = 'https://cdn-icons-png.flaticon.com/128/2014/2014952.png' ; // Thay đổi icon cho LED bật
        } else {
            document.getElementById('warning-icon').src = 'https://cdn-icons-png.flaticon.com/128/2014/2014901.png'; // Thay đổi icon cho LED tắt
        }
    } catch (error) {
        console.error('Error fetching LED3 status:', error);
    }
}

setInterval(fetchLed3Status, 2000);


function switchTab(tabId) {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        activeTab.classList.remove('active');
    }

    const activeSidebarTab = document.querySelector('.table.active');
    if (activeSidebarTab) {
        activeSidebarTab.classList.remove('active');
    }
    const selectedSidebarTab = document.querySelector(`.table[onclick="switchTab('${tabId}')"]`);
    if (selectedSidebarTab) {
        selectedSidebarTab.classList.add('active');
    }

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    switchTab('tab1');  
});

