import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

export default function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F3EE' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C4613A', marginBottom: 8 }}>Main</Text>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A120A', marginBottom: 32 }}>Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('BadgeDetail')}
          style={{ backgroundColor: '#C4613A', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Badge Detail →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={{ borderWidth: 1.5, borderColor: '#C4613A', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' }}
        >
          <Text style={{ color: '#C4613A', fontSize: 15, fontWeight: '600' }}>Settings →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
