import React from 'react';
import { View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface HeaderRightProps {
  onExport: () => void;
}

export const HeaderRight: React.FC<HeaderRightProps> = ({ onExport }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Pressable
        onPress={onExport}
        style={({ pressed }) => ({
          marginRight: 10,
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <FontAwesome name="share-alt" size={25} color="black" />
      </Pressable>
      <Link href="/modal" asChild>
        <Pressable>
          {({ pressed }) => (
            <FontAwesome
              name="question-circle"
              size={25}
              style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
      </Link>
    </View>
  );
}; 