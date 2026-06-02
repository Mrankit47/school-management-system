import os
import django
import sys
import socket

# Setup Django if needed (just in case)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
try:
    django.setup()
except Exception:
    pass

from zk import ZK

DEVICE_IP = '192.168.0.103'

# We will try different settings
ports = [4370, 5005]
protocols = [False, True] # force_udp=False (TCP), force_udp=True (UDP)
passwords = [0, 1234]

print("=" * 60)
print(f"   DIAGNOSING BIOMETRIC CONNECTION TO {DEVICE_IP}")
print("=" * 60)

# Quick port scanning first
for port in ports:
    print(f"\nChecking if port {port} is open on {DEVICE_IP} (TCP)...")
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex((DEVICE_IP, port))
    if result == 0:
        print(f"[TCP PORT OPEN] Port {port} is open and listening!")
    else:
        print(f"[TCP PORT CLOSED] Port {port} is closed or unreachable.")
    sock.close()

# Try pyzk connections
for port in ports:
    for force_udp in protocols:
        for password in passwords:
            proto_name = "UDP" if force_udp else "TCP"
            print(f"\nTesting: Port={port} | Protocol={proto_name} | Password={password}...")
            
            # Create connection instance
            zk = ZK(DEVICE_IP, port=port, timeout=3, password=password, force_udp=force_udp, ommit_ping=True)
            conn = None
            try:
                conn = zk.connect()
                print("*" * 60)
                print(f"[SUCCESS!!!] CONNECTED SUCCESSFULLY WITH:")
                print(f"  -> Port: {port}")
                print(f"  -> Protocol: {proto_name}")
                print(f"  -> Password: {password}")
                print("*" * 60)
                
                # Try getting device name
                try:
                    dev_name = conn.get_device_name()
                    print(f"Device Name: {dev_name}")
                except Exception as e:
                    print(f"Could not fetch device name: {e}")
                
                # Close connection
                conn.disconnect()
                print("\nUse these settings in your biometric_bridge.py file!")
                sys.exit(0)
            except Exception as err:
                print(f"[FAILED] Error: {err}")

print("\n" + "=" * 60)
print("[CRITICAL] Could not connect using any standard settings.")
print("Suggestions:")
print("1. Check if another software (like ZKTime, Essl, or another script) is already connected to the machine. ZK machines allow only ONE connection at a time.")
print("2. Check the machine menu settings (Network/Comm -> Comm Key) to see if there is a different password set.")
print("3. Restart the biometric machine and try running this diagnosis again.")
print("=" * 60)
