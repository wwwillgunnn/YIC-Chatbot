import argparse, json, sys, serial
from pathlib import Path

def load_defaults():
    candidates = [
        Path(__file__).with_name("device_defaults.json"),
        Path.cwd() / "src" / "services" / "device_defaults.json",
    ]
    for p in candidates:
        if p.exists():
            with p.open() as f:
                return json.load(f)
    return {}

DEVICE_DEFAULTS = load_defaults()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--device", required=True)
    parser.add_argument("--action", required=True)  # turn_on | turn_off | custom
    parser.add_argument("--payload")
    parser.add_argument("--port")
    parser.add_argument("--baud", type=int)
    parser.add_argument("--bytesize", type=int, default=8)
    parser.add_argument("--parity", default="N", choices=["N","E","O","M","S"])
    parser.add_argument("--stopbits", type=float, default=1.0)
    args = parser.parse_args()

    if args.device not in DEVICE_DEFAULTS and (not args.port or not args.payload):
        print(json.dumps({"ok": False,
                          "error": f"Unknown device '{args.device}' and no overrides provided"}))
        sys.exit(1)

    cfg = DEVICE_DEFAULTS.get(args.device, {})
    port = args.port or cfg.get("port")
    baudrate = args.baud or cfg.get("baudrate", 38400)

    payload = args.payload
    if not payload:
        payload = (cfg.get("payloads") or {}).get(args.action)
        if not payload:
            print(json.dumps({"ok": False,
                              "error": f"No payload for action '{args.action}' on '{args.device}'"}))
            sys.exit(1)

    try:
        ser = serial.Serial(
            port=port, baudrate=baudrate,
            bytesize=serial.EIGHTBITS if args.bytesize == 8 else args.bytesize,
            parity={"N": serial.PARITY_NONE, "E": serial.PARITY_EVEN,
                    "O": serial.PARITY_ODD, "M": serial.PARITY_MARK,
                    "S": serial.PARITY_SPACE}[args.parity],
            stopbits=serial.STOPBITS_ONE if args.stopbits == 1.0 else serial.STOPBITS_TWO,
            timeout=1
        )
        ser.write(payload.encode("ascii")); ser.flush(); ser.close()
        print(json.dumps({"ok": True, "device": args.device, "action": args.action,
                          "port": port, "baudrate": baudrate, "payload": payload}))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e), "device": args.device,
                          "action": args.action, "port": port, "baudrate": baudrate,
                          "payload": payload}))
        sys.exit(1)

if __name__ == "__main__":
    main()
