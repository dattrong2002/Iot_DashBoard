import paho.mqtt.client as mqtt
import mysql.connector
import json  
from datetime import datetime
  
db = mysql.connector.connect(
    host="localhost",        
    user="root",   
    password="zxcvbnmz33",
    database="sensordata"
)

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe("sensor")
    client.subscribe("led")

def on_message(client, userdata, msg):

    try:
        data = json.loads(msg.payload.decode())

        if msg.topic == "sensor":

            temperature = float(data.get("temperature", 0)[:-1])
            humidity = float(data.get("humidity", 0)[:-1])
            light = float(data.get("light", 0)[:-3])
            dust = float(data.get("dust",0)[:-1])

            cursor = db.cursor()
            sql = "INSERT INTO sensor_data (temperature, humidity, light, dust) VALUES (%s, %s, %s, %s)"
            values = (temperature, humidity, light, dust)
            cursor.execute(sql, values)
            db.commit()


        elif msg.topic == "led":
            led1_status = data.get("led1", "off")
            led2_status = data.get("led2", "off")
            led3_status = data.get("led3", "off")

            cursor = db.cursor()

            if "led1" in data:
                sql_led1 = "INSERT INTO device_status (Device, Status) VALUES (%s, %s)"
                cursor.execute(sql_led1, ("LED 1", led1_status))
                print(f"Inserted LED1 status: {led1_status}")

            if "led2" in data:
                sql_led2 = "INSERT INTO device_status (Device, Status) VALUES (%s, %s)"
                cursor.execute(sql_led2, ("LED 2", led2_status))
                print(f"Inserted LED2 status: {led2_status}")

            if "led3" in data:
                sql_led3 = "INSERT INTO device_status (Device, Status) VALUES (%s, %s)"
                cursor.execute(sql_led3, ("Warning Led", led3_status))
                print(f"Inserted LED3 status: {led3_status}")

        db.commit()
    except Exception as e:
        print(f"Error: {e}")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.username_pw_set("dattrong2002", "123")
client.connect("192.168.110.225", 1883, 60)

client.loop_forever()