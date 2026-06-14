import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

export default function MemberProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F3EE' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C4613A', marginBottom: 8 }}>Crew</Text>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A120A', marginBottom: 48 }}>Member Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ borderWidth: 1.5, borderColor: '#1A120A', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 }}
        >
          <Text style={{ color: '#1A120A', fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
