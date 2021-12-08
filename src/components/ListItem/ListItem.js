/* eslint-disable prettier/prettier */
import React from 'react';
import {StyleSheet, Text, View, Platform, Pressable} from 'react-native';

const ListItem = ({onPress, item}) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.row}>
        <Text>{item.rssi || 'Sin marca'}</Text>
      </View>
      <View style={[styles.row]}>
        <Text>{item.id || '--- ---'}</Text>
      </View>
      <View style={[styles.row]}>
        <Text>{item.localName}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //alignItems: 'center',
    marginRight: 10,
    marginLeft: 10,
    textAlignVertical: 'center',
    padding: 5,
    //borderBottomColor: Colors.zircon,
    borderBottomWidth: 1,
    paddingLeft: Platform.OS == 'ios' ? 0 : 16,
    marginLeft: Platform.OS == 'ios' ? 16 : 0,
  },
  row: {
    flexDirection: 'row',
  },
});

export default ListItem;
