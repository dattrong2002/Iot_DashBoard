#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#define led1 2
#define led2 4
#define led3 5

const int DHTPIN = 18;
const int DHTTYPE = DHT11;

DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "Redmi 10";
const char* password = "05102003";

const char* mqtt_server = "192.168.110.225";
const char* mqtt_topics[] = {
  "sensor",
  "led"
};

float temperature;
float humidity;
float light;
float dust;

const int mqtt_port = 1883;

const char* mqtt_username = "dattrong2002";
const char* mqtt_password = "123";

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsgTime = 0;
const long interval = 10000;
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Failed to connect to WiFi.");
    return;
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;

  for (int i = 0; i < length; i++) {
    messageTemp += (char)message[i];
  }
   Serial.println(messageTemp);
  if (messageTemp == "all_on") {
    digitalWrite(led1, 1);
    digitalWrite(led2, 1);
    return;
  }
  if (messageTemp == "all_off") {
    digitalWrite(led1, 0);
    digitalWrite(led2, 0);
    return;
  }
  StaticJsonDocument<300> doc;
  DeserializationError error = deserializeJson(doc, messageTemp);
  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.f_str());
    return;
  }
  const char* led1State = doc["led1"];
  const char* led2State = doc["led2"];
  const char* led3State = doc["led3"];
  // Điều khiển các LED dựa trên trạng thái từ JSON
  if (doc.containsKey("led1")) {
    const char* led1State = doc["led1"];
     if(strcmp(led1State, "on") == 0 ) digitalWrite(led1,1); else digitalWrite(led1,0);
  }
  
  if (doc.containsKey("led2")) {
    const char* led2State = doc["led2"];
     if(strcmp(led2State, "on") == 0 ) digitalWrite(led2,1); else digitalWrite(led2,0);
  }
}
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32Client", mqtt_username, mqtt_password)) {
      Serial.println("connected");
      for (int i = 0; i < 2; i++) {
        client.subscribe(mqtt_topics[i]);
        Serial.print("Subscribed to: ");
        Serial.println(mqtt_topics[i]);
      }
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  dht.begin();
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  pinMode(led3, OUTPUT);
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}
void generateRandomSensorData() {
  temperature = random(200, 250) / 10.0;

  humidity = random(400, 450) / 10.0;

  light = random(999, 1100) / 10.0;

  dust = random(10,1000) / 10.0;
}
void sendSensorData() {
  StaticJsonDocument<200> doc;
  //float humidity = dht.readHumidity();  
  //float temperature = dht.readTemperature();
  //float light = random(9900, 10500) / 100.0;  

  String temperatureStr = String(temperature, 1) + "C";
  String humidityStr = String(humidity, 1) + "%";
  String lightStr = String(light, 1) + "lux";
  String dustStr = String(dust, 1) + "%";
  doc["temperature"] = temperatureStr;
  doc["humidity"] = humidityStr;
  doc["light"] = lightStr;
  doc["dust"] = dustStr;
  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer);  // Chuyển dữ liệu thành chuỗi JSON

  // Gửi dữ liệu tới topic "sensor"
  client.publish("sensor", jsonBuffer);
  Serial.print("Published: ");
  Serial.println(jsonBuffer);
}
void sendLed3Status(const char* status) {
  StaticJsonDocument<200> doc;
  doc["led3"] = status;
  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer);
  client.publish("led", jsonBuffer);
  Serial.print("Published LED 3 state: ");
  Serial.println(jsonBuffer);
}

unsigned long lastBlinkTime = 0;  // Lưu thời gian cho LED nhấp nháy
int led3State = 0;

void blinkLed3() {
  unsigned long now = millis();
  if (now - lastBlinkTime > 500) {  // Nhấp nháy với chu kỳ 0.5s
    led3State = !led3State;
    digitalWrite(led3, led3State);
    lastBlinkTime = now;

    // Gửi trạng thái LED 3 lên MQTT
    if (led3State) {
      sendLed3Status("on");
    } else {
      sendLed3Status("off");
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  unsigned long now = millis();
    if (dust > 70) {
      blinkLed3();
    } else {
      digitalWrite(led3, LOW);  // Tắt LED 3 nếu nhiệt độ nhỏ hơn hoặc bằng 25 độ
    }
    if (now - lastMsgTime > interval) {
      lastMsgTime = now;
      generateRandomSensorData();
      sendSensorData();
    }
}