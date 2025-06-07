import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, Button, Text, View, Picker, ScrollView, FlatList } from 'react-native';

const BACKEND_URL = "http://localhost:3001"; // Change to your backend host if using phone/emulator

export default function App() {
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('English');
  const [reply, setReply] = useState('');
  const [week, setWeek] = useState(1);
  const [tip, setTip] = useState({});
  const [languages, setLanguages] = useState(["English", "Hausa", "Igbo", "Yoruba", "Pidgin", "Fulfulde"]);
  const [faqs, setFaqs] = useState([]);
  const [allTips, setAllTips] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/languages`).then(r => r.json()).then(data => setLanguages(data.supported));
    fetch(`${BACKEND_URL}/faqs`).then(r => r.json()).then(setFaqs);
    fetch(`${BACKEND_URL}/all-tips`).then(r => r.json()).then(setAllTips);
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/tips/${week}`).then(r => r.json()).then(setTip);
  }, [week]);

  const sendMessage = async () => {
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language }),
    });
    const data = await res.json();
    setReply(data.reply);
  };

  return (
    <SafeAreaView style={{ padding: 12 }}>
      <ScrollView>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>MamaCare AI</Text>
        {/* Language Picker */}
        <Text>Select Language:</Text>
        <Picker selectedValue={language} onValueChange={setLanguage}>
          {languages.map(l => <Picker.Item label={l} value={l} key={l} />)}
        </Picker>
        {/* Chat UI */}
        <TextInput
          style={{ borderWidth: 1, marginVertical: 8, padding: 8 }}
          placeholder="Ask a question..."
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Send" onPress={sendMessage} />
        {reply ? <View style={{ marginVertical: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>AI Reply:</Text>
          <Text>{reply}</Text>
        </View> : null}
        {/* Pregnancy Tracker */}
        <View style={{ marginVertical: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Pregnancy Tracker</Text>
          <Text>Week: {week}</Text>
          <Button title="Previous" onPress={() => setWeek(w => Math.max(1, w - 1))} />
          <Button title="Next" onPress={() => setWeek(w => Math.min(40, w + 1))} />
          {tip && tip.tip ? (
            <View>
              <Text>Tip: {tip.tip}</Text>
              <Text>Do: {tip.do && tip.do.join(', ')}</Text>
              <Text>Don't: {tip.dont && tip.dont.join(', ')}</Text>
            </View>
          ) : null}
        </View>
        {/* FAQs */}
        <View style={{ marginVertical: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>FAQs</Text>
          {faqs.map((f, idx) => (
            <View key={idx} style={{ marginBottom: 6 }}>
              <Text>Q: {f.question[language]}</Text>
              <Text>A: {f.answer[language]}</Text>
            </View>
          ))}
        </View>
        {/* Weekly List */}
        <View style={{ marginVertical: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>All Weekly Tips</Text>
          <FlatList
            data={allTips}
            keyExtractor={item => item.week.toString()}
            renderItem={({ item }) => (
              <Text>Week {item.week}: {item.tip}</Text>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
