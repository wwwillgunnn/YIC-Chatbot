import { SerialPort } from "serialport";

export async function sendSerialCommand() {
  return new Promise<void>((resolve, reject) => {
    const port = new SerialPort({
      path: "/dev/tty.usbserial-10", // your device path
      baudRate: 38400,
      dataBits: 8,
      parity: "none",
      stopBits: 1,
      autoOpen: false,
    });

    port.open((err) => {
      if (err) {
        return reject(`Error opening serial port: ${err.message}`);
      }

      // Send command as ASCII text "3101"
      port.write("3101", (err) => {
        if (err) {
          port.close();
          return reject(`Error writing to serial port: ${err.message}`);
        }
        port.drain(() => {
          port.close();
          resolve();
        });
      });
    });
  });
}
