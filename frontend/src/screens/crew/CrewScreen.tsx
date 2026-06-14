import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

export default function CrewScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F3EE' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C4613A', marginBottom: 8 }}>Main</Text>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A120A', marginBottom: 32 }}>Crew</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('MemberProfile')}
          style={{ backgroundColor: '#C4613A', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Member Profile →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('SprintSummary')}
          style={{ borderWidth: 1.5, borderColor: '#C4613A', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' }}
        >
          <Text style={{ color: '#C4613A', fontSize: 15, fontWeight: '600' }}>Sprint Summary →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
