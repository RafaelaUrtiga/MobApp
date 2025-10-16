import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Event } from '../storage/db';

export function EventItem({ item, onPress }: { item: Event; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.card}>
      <Text style={s.title}>{item.title}</Text>
      <Text style={s.sub}>{new Date(item.date).toLocaleString()}</Text>
      {item.location ? <Text style={s.sub}>{item.location}</Text> : null}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '700' },
  sub: { color: '#666', marginTop: 2 },
});
export default EventItem;