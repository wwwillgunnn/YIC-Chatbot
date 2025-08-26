import sys
import serial

# Arguments: python3 YICTEST.py <device_id> <action>
if len(sys.argv) < 3:
    print("Usage: python3 YICTEST.py <device_id> <action>")
    sys.exit(1)

device_id = sys.argv[1]
action = sys.argv[2]

# Configure the serial connection
ser = serial.Serial(
    port='/dev/tty.usbserial-10',  # adjust to your system
    baudrate=38400,
    bytesize=serial.EIGHTBITS,
    parity=serial.PARITY_NONE,
    stopbits=serial.STOPBITS_ONE,
    timeout=1
)

# Example: write "<device_id>:<action>" (simple protocol)
command = f"{device_id}:{action}".encode()
ser.write(command)

ser.close()

print(f"Sent '{command.decode()}' to device {device_id}")



# ! Old working version
# import serial

# # Configure the serial connection
# ser = serial.Serial(
#     port='/dev/tty.usbserial-10',  # your device path
#     baudrate=38400,
#     bytesize=serial.EIGHTBITS,
#     parity=serial.PARITY_NONE,
#     stopbits=serial.STOPBITS_ONE,
#     timeout=1
# )

# # Send "3101" as ASCII text
# ser.write(b"3101")

# # If you needed it as raw bytes instead (e.g. hex 0x31 0x01):
# # ser.write(bytes([0x31, 0x01]))

# ser.close()
# print("Sent '3101' to /dev/tty.usbserial-10")
