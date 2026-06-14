import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

export default function WaitingRoomScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F3EE' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C4613A', marginBottom: 8 }}>Onboarding</Text>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A120A', marginBottom: 48 }}>Waiting Room</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('YoureIn')}
          style={{ backgroundColor: '#C4613A', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
