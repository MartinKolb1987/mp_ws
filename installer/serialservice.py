import serial
import time
import io
import os

# use Arduino Serial Port and send to TextIOWrapper
ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
sio = io.TextIOWrapper(io.BufferedRWPair(ser, ser))

# wait for Arduino to initialize
time.sleep(2)
# send boot command and clear buffer
sio.write(unicode("y"))
sio.flush()

# on shutdown command, execute shutdown script
while True:
    serialOutput = sio.readline()
    print serialOutput
    if "SHUTDOWN" in serialOutput:
        os.system("poweroff")
        break

# close connection
ser.close()
