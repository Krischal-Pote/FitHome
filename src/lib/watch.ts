import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import type { BleManager, Device, Subscription } from 'react-native-ble-plx';

const HR_SVC = '180d';
const HR_CHR = '2a37';

export function parseHr(b64: string) {
  const b = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
  return b[0] & 1 ? b[1] | (b[2] << 8) : b[1];
}

async function perms() {
  if (Platform.OS !== 'android') return true;
  const P = PermissionsAndroid.PERMISSIONS;
  const r = await PermissionsAndroid.requestMultiple([P.BLUETOOTH_SCAN, P.BLUETOOTH_CONNECT, P.ACCESS_FINE_LOCATION]);
  return Object.values(r).every((v) => v === 'granted') || r[P.BLUETOOTH_CONNECT] === 'granted';
}

export function useWatch() {
  const mgr = useRef<BleManager | null>(null);
  const sub = useRef<Subscription | null>(null);
  const [found, setFound] = useState<Device[]>([]);
  const [msg, setMsg] = useState('');
  const [name, setName] = useState<string | null>(null);
  const [hr, setHr] = useState<number | null>(null);

  const get = () => {
    if (!mgr.current) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      mgr.current = new (require('react-native-ble-plx') as typeof import('react-native-ble-plx')).BleManager();
    }
    return mgr.current;
  };

  useEffect(() => () => { sub.current?.remove(); mgr.current?.destroy(); }, []);

  const scan = async () => {
    try {
      if (!(await perms())) return setMsg('Bluetooth permission denied');
      const m = get();
      setFound([]); setMsg('Scanning… (open watch Bluetooth, keep it near)');
      m.startDeviceScan(null, null, (e, d) => {
        if (e) { setMsg(e.message); return; }
        if (d?.name) setFound((f) => (f.some((x) => x.id === d.id) ? f : [...f, d]));
      });
      setTimeout(() => { m.stopDeviceScan(); setMsg((x) => (x.startsWith('Scanning') ? 'Scan done' : x)); }, 10000);
    } catch (e) { setMsg(String((e as Error).message ?? e)); }
  };

  const connect = async (d: Device) => {
    try {
      const m = get(); m.stopDeviceScan(); setMsg(`Connecting to ${d.name}…`);
      const dev = await (await d.connect()).discoverAllServicesAndCharacteristics();
      setName(d.name); setFound([]); setMsg('Connected. Waiting for heart rate…');
      sub.current?.remove();
      sub.current = dev.monitorCharacteristicForService(HR_SVC, HR_CHR, (e, c) => {
        if (e) return setMsg('Connected, but watch has no standard heart-rate service');
        if (c?.value) { setHr(parseHr(c.value)); setMsg('Connected'); }
      });
    } catch (e) { setMsg(String((e as Error).message ?? e)); }
  };

  return { found, msg, name, hr, scan, connect };
}
