/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, Button, PermissionsAndroid} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';
import ListItem from './components/ListItem/ListItem';
import {Buffer} from 'buffer';

export const manager = new BleManager();

const requestPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Request for Location Permission',
      message: 'Bluetooth Scanner requires access to Fine Location Permission',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

function getServicesAndCharacteristics(device) {
  return new Promise((resolve, reject) => {
    device.services().then(services => {
      const characteristics = [];
      console.log('ashu_1', services);
      services.forEach((service, i) => {
        service.characteristics().then(c => {
          console.log('service.characteristics');

          characteristics.push(c);
          console.log(characteristics);
          if (i === services.length - 1) {
            const temp = characteristics.reduce((acc, current) => {
              return [...acc, ...current];
            }, []);
            const dialog = temp.find(
              characteristic => characteristic.isWritableWithoutResponse,
            );
            if (!dialog) {
              reject('No writable characteristic');
            }
            resolve(dialog);
          }
        });
      });
    });
  });
}

// BlueetoothScanner does:
// - access/enable bluetooth module
// - scan bluetooth devices in the area
// - list the scanned devices
const BluetoothScanner = () => {
  const [logData, setLogData] = useState([]);
  const [logCount, setLogCount] = useState(0);
  const [scannedDevices, setScannedDevices] = useState({});
  const [deviceCount, setDeviceCount] = useState(0);
  const [deviceList, setDeviceList] = useState([]);

  useEffect(() => {
    manager.onStateChange(state => {
      const subscription = manager.onStateChange(async state => {
        //console.log(state);
        const newLogData = logData;
        newLogData.push(state);
        await setLogCount(newLogData.length);
        await setLogData(newLogData);
        subscription.remove();
      }, true);
      return () => subscription.remove();
    });
  }, [manager]);

  const handlePressBle = device => {
    manager
      .connectToDevice(device.id, null)
      .then(device => {
        console.log('Connected to device:', device.id);
        (async () => {
          const services = await device.discoverAllServicesAndCharacteristics();
          const characteristic = await getServicesAndCharacteristics(services);
          console.log('characteristic');
          console.log(characteristic);
          console.log(
            'Discovering services and characteristics',
            characteristic.uuid,
          );
        })();
      })
      .catch(error => {
        console.log('Connection failed:', error);
      });

    manager.isDeviceConnected(device.id).then(isConnected => {
      console.log('isConnected', isConnected);
    });

    console.log('ITEM - PRESIONADO', device.id);
  };

  return (
    <View style={{flex: 1, padding: 10}}>
      <View style={{flex: 1, padding: 10}}>
        <Text style={{fontWeight: 'bold'}}>Bluetooth Log ({logCount})</Text>
        <FlatList
          data={logData}
          renderItem={({item}) => {
            return <Text>{item}</Text>;
          }}
        />
        <Button
          title="Turn On Bluetooth"
          onPress={async () => {
            const btState = await manager.state();
            // test is bluetooth is supported
            if (btState === 'Unsupported') {
              alert('Bluetooth is not supported');
              return false;
            }
            // enable if it is not powered on
            if (btState !== 'PoweredOn') {
              await manager.enable();
            } else {
              await manager.disable();
            }
            return true;
          }}
        />
      </View>

      <View style={{flex: 2, padding: 10}}>
        <Text style={{fontWeight: 'bold'}}>
          Scanned Devices ({deviceCount})
        </Text>
        <FlatList
          data={Object.values(scannedDevices)}
          renderItem={({item}) => {
            return (
              <ListItem item={item} onPress={() => handlePressBle(item)} />
            );
          }}
        />

        <Button
          title="Scan Devices"
          onPress={async () => {
            const btState = await manager.state();
            // test if bluetooth is powered on
            if (btState !== 'PoweredOn') {
              alert('Bluetooth is not powered on');
              return false;
            }
            // explicitly ask for user's permission
            const permission = await requestPermission();
            if (permission) {
              manager.startDeviceScan(null, null, async (error, device) => {
                // error handling
                console.log('Scanning for devices...');

                if (error) {
                  console.log('errorr', error);
                  return;
                }

                console.log(
                  device.id === 'C4:28:8C:54:D8:25' ? 'HOLA SOLEDAD' : 'no',
                );
                // found a bluetooth device
                if (device.localName === 'Finder') {
                  console.log(device);

                  console.log('device found', device.id);

                  const newScannedDevices = scannedDevices;
                  newScannedDevices[device.id] = device;
                  await setDeviceCount(Object.keys(newScannedDevices).length);
                  await setScannedDevices(scannedDevices);
                }
              });
            }
            return true;
          }}
        />
      </View>
    </View>
  );
};

export default BluetoothScanner;
