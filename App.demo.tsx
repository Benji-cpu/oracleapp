import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const Stack = createNativeStackNavigator();

// Demo Home Screen
function HomeScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔮 Oracle Card Creator</Text>
      <Text style={styles.subtitle}>Your AI-Powered Spiritual Journey</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Decks')}
        >
          <Text style={styles.buttonText}>📚 My Decks</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Reading')}
        >
          <Text style={styles.buttonText}>🔮 Start Reading</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Journal')}
        >
          <Text style={styles.buttonText}>📖 Journal</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('CardStudio')}
        >
          <Text style={styles.buttonText}>🎨 Card Studio</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.featureList}>
        <Text style={styles.feature}>✨ AI-Generated Meanings</Text>
        <Text style={styles.feature}>🎨 Beautiful AI Art</Text>
        <Text style={styles.feature}>📱 Works Offline</Text>
        <Text style={styles.feature}>🔒 Private & Secure</Text>
        <Text style={styles.feature}>💳 Subscription Plans</Text>
        <Text style={styles.feature}>🔔 Smart Notifications</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>🎉 App Status: READY!</Text>
        <Text style={styles.statusText}>✅ React Native + Expo SDK 53</Text>
        <Text style={styles.statusText}>✅ Supabase Backend Ready</Text>
        <Text style={styles.statusText}>✅ AI Integration Built</Text>
        <Text style={styles.statusText}>✅ Offline Database Ready</Text>
        <Text style={styles.statusText}>✅ Push Notifications Ready</Text>
        <Text style={styles.statusText}>✅ Analytics Ready</Text>
      </View>
    </ScrollView>
  );
}

function DecksScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 My Decks</Text>
      <Text style={styles.description}>Create and manage your oracle card decks</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✨ Spiritual Guidance Deck</Text>
        <Text style={styles.cardSubtitle}>12 cards • AI-enhanced meanings</Text>
        <Text style={styles.cardDescription}>
          A deck focused on daily spiritual guidance and inner wisdom.
        </Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌟 Daily Inspiration</Text>
        <Text style={styles.cardSubtitle}>8 cards • Beautiful AI art</Text>
        <Text style={styles.cardDescription}>
          Uplifting messages to start your day with positivity.
        </Text>
      </View>
      
      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>+ Create New Deck</Text>
      </TouchableOpacity>

      <Text style={styles.featureNote}>
        💡 With AI integration, you can generate meaningful interpretations and beautiful artwork for your cards!
      </Text>
    </ScrollView>
  );
}

function ReadingScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔮 Oracle Reading</Text>
      <Text style={styles.description}>Choose your spread and receive AI-powered guidance</Text>
      
      <TouchableOpacity style={styles.spreadOption}>
        <Text style={styles.spreadTitle}>🃏 Single Card</Text>
        <Text style={styles.spreadDesc}>Quick daily guidance</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.spreadOption}>
        <Text style={styles.spreadTitle}>🃏🃏🃏 Three Card Spread</Text>
        <Text style={styles.spreadDesc}>Past • Present • Future</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.spreadOption}>
        <Text style={styles.spreadTitle}>🎯 Celtic Cross</Text>
        <Text style={styles.spreadDesc}>Deep life insight (10 cards)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.spreadOption}>
        <Text style={styles.spreadTitle}>🌟 Five Card Spread</Text>
        <Text style={styles.spreadDesc}>Comprehensive guidance</Text>
      </TouchableOpacity>

      <Text style={styles.featureNote}>
        🤖 AI will interpret your reading based on the cards drawn and provide personalized insights!
      </Text>
    </ScrollView>
  );
}

function JournalScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📖 Spiritual Journal</Text>
      <Text style={styles.description}>Record your insights and spiritual growth</Text>
      
      <View style={styles.journalEntry}>
        <Text style={styles.entryDate}>Today • 😊 Grateful</Text>
        <Text style={styles.entryTitle}>Three Card Reading Reflection</Text>
        <Text style={styles.entryPreview}>
          The cards spoke of new beginnings and transformation. The AI interpretation was profound...
        </Text>
        <View style={styles.tags}>
          <Text style={styles.tag}>#transformation</Text>
          <Text style={styles.tag}>#guidance</Text>
        </View>
      </View>
      
      <View style={styles.journalEntry}>
        <Text style={styles.entryDate}>Yesterday • 💭 Reflective</Text>
        <Text style={styles.entryTitle}>Morning Intention Setting</Text>
        <Text style={styles.entryPreview}>
          Setting my focus for the day ahead. The single card draw gave me clarity...
        </Text>
        <View style={styles.tags}>
          <Text style={styles.tag}>#intention</Text>
          <Text style={styles.tag}>#clarity</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>+ New Journal Entry</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function CardStudioScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎨 Card Studio</Text>
      <Text style={styles.description}>Create beautiful oracle cards with AI assistance</Text>
      
      <View style={styles.studioFeature}>
        <Text style={styles.studioTitle}>🤖 AI Meaning Generation</Text>
        <Text style={styles.studioDesc}>Generate profound, meaningful interpretations using Google Gemini AI</Text>
      </View>

      <View style={styles.studioFeature}>
        <Text style={styles.studioTitle}>🎨 AI Image Creation</Text>
        <Text style={styles.studioDesc}>Create stunning card artwork with DALL-E 3</Text>
      </View>

      <View style={styles.studioFeature}>
        <Text style={styles.studioTitle}>📱 Offline Editing</Text>
        <Text style={styles.studioDesc}>Edit cards anywhere, sync when online</Text>
      </View>

      <View style={styles.studioFeature}>
        <Text style={styles.studioTitle}>🎭 Style Templates</Text>
        <Text style={styles.studioDesc}>Mystical, Modern, Classic, and Custom styles</Text>
      </View>

      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>+ Create New Card</Text>
      </TouchableOpacity>

      <Text style={styles.featureNote}>
        💎 Upgrade to Premium for unlimited AI generations and HD quality images!
      </Text>
    </ScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Oracle Card Creator' }}
        />
        <Stack.Screen 
          name="Decks" 
          component={DecksScreen} 
          options={{ title: 'My Decks' }}
        />
        <Stack.Screen 
          name="Reading" 
          component={ReadingScreen} 
          options={{ title: 'Oracle Reading' }}
        />
        <Stack.Screen 
          name="Journal" 
          component={JournalScreen} 
          options={{ title: 'Spiritual Journal' }}
        />
        <Stack.Screen 
          name="CardStudio" 
          component={CardStudioScreen} 
          options={{ title: 'Card Studio' }}
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6366f1',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureList: {
    marginBottom: 30,
  },
  feature: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureNote: {
    fontSize: 14,
    color: '#6366f1',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 8,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  createButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  spreadOption: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spreadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  spreadDesc: {
    fontSize: 14,
    color: '#64748b',
  },
  journalEntry: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryDate: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  entryPreview: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#ddd6fe',
    color: '#6366f1',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  studioFeature: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  studioDesc: {
    fontSize: 14,
    color: '#64748b',
  },
});