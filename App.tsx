import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';

const Stack = createNativeStackNavigator();

// Simple state management for decks
interface Deck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  createdAt: string;
  // User's spiritual input
  intention?: string;
  spiritualSymbols?: string;
  inspiration?: string;
  basePrompt?: string;
}

interface Card {
  id: string;
  deckId: string;
  title: string;
  meaning: string;
  position: number;
}

// Global state (in a real app, this would be Zustand + WatermelonDB)
let decks: Deck[] = [];
let cards: Card[] = [];

// Home Screen
function HomeScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔮 Oracle Card Creator</Text>
      <Text style={styles.subtitle}>Your AI-Powered Spiritual Journey</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('DeckList')}
        >
          <Text style={styles.buttonText}>📚 My Decks ({decks.length})</Text>
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
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>🎯 Real Functionality Enabled</Text>
        <Text style={styles.statusText}>✅ Create and manage actual decks</Text>
        <Text style={styles.statusText}>✅ Add cards to your decks</Text>
        <Text style={styles.statusText}>✅ Edit deck properties</Text>
        <Text style={styles.statusText}>✅ Delete decks and cards</Text>
        <Text style={styles.statusText}>⏳ AI integration (requires setup)</Text>
      </View>
    </ScrollView>
  );
}

// Deck List Screen - Shows all user's decks
function DeckListScreen({ navigation }: any) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Refresh when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      setRefreshKey(prev => prev + 1);
    });
    return unsubscribe;
  }, [navigation]);

  const handleDeleteDeck = (deckId: string) => {
    Alert.alert(
      'Delete Deck',
      'Are you sure you want to delete this deck? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            decks = decks.filter(deck => deck.id !== deckId);
            cards = cards.filter(card => card.deckId !== deckId);
            setRefreshKey(prev => prev + 1);
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 My Decks</Text>
      <Text style={styles.description}>Create and manage your oracle card decks</Text>
      
      {decks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No decks yet</Text>
          <Text style={styles.emptyDesc}>Create your first oracle deck to get started</Text>
        </View>
      ) : (
        decks.map((deck) => {
          const deckCards = cards.filter(card => card.deckId === deck.id);
          return (
            <TouchableOpacity
              key={deck.id}
              style={styles.deckCard}
              onPress={() => navigation.navigate('DeckDetail', { deckId: deck.id })}
            >
              <View style={styles.deckHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deckTitle}>{deck.name}</Text>
                  <Text style={styles.deckSubtitle}>
                    {deckCards.length} cards • Created {new Date(deck.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.deckDescription}>{deck.description}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteDeck(deck.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })
      )}
      
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('DeckCreate')}
      >
        <Text style={styles.createButtonText}>+ Create New Deck</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// AI Deck Generation Screen
function DeckCreateScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [intention, setIntention] = useState('');
  const [spiritualSymbols, setSpiritualSymbols] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [cardCount, setCardCount] = useState('8');
  const [basePrompt, setBasePrompt] = useState('Create a meaningful oracle card with the title "{title}". The card should provide spiritual guidance about {theme}. Consider the user\'s intention: "{intention}", their connection to symbols: "{symbols}", and what inspires them: "{inspiration}". Generate a profound, personalized meaning that offers wisdom, hope, and actionable guidance for their spiritual journey.');
  const [generating, setGenerating] = useState(false);

  const generateCardWithAI = async (title: string, theme: string) => {
    // Personalized prompt using user input
    const personalizedPrompt = basePrompt
      .replace('{title}', title)
      .replace('{theme}', theme.toLowerCase())
      .replace('{intention}', intention || 'personal growth and spiritual development')
      .replace('{symbols}', spiritualSymbols || 'universal spiritual symbols')
      .replace('{inspiration}', inspiration || 'ancient wisdom traditions');

    // In a real app, this would call actual AI API (OpenAI, Gemini, etc.)
    // For now, simulate AI generation with meaningful content
    const aiMeanings = [
      `This card illuminates the path of ${theme.toLowerCase()}, drawing from the sacred energy of ${spiritualSymbols || 'universal symbols'}. Your intention to ${intention || 'grow spiritually'} resonates deeply with this guidance. ${inspiration ? `Inspired by ${inspiration}, this card` : 'This card'} reminds you that transformation begins with a single step toward authenticity. Trust in your inner wisdom as you navigate this aspect of your journey.`,
      
      `The essence of ${theme.toLowerCase()} flows through this card, connecting you to the profound wisdom you seek. ${spiritualSymbols ? `Like the sacred ${spiritualSymbols}, this card` : 'This card'} represents the divine potential within you. Your desire for ${intention || 'spiritual growth'} is honored here. ${inspiration ? `Drawing from ${inspiration}, you` : 'You'} are reminded that every ending is a new beginning, every challenge a teacher, every moment an opportunity for grace.`,
      
      `${title} emerges as a beacon of light on your spiritual path, reflecting your deep intention to ${intention || 'find meaning and purpose'}. This card speaks to the sacred connection between ${spiritualSymbols || 'all living things'} and your soul's journey. ${inspiration ? `Rooted in the wisdom of ${inspiration}, this guidance` : 'This guidance'} invites you to embrace the transformative power of ${theme.toLowerCase()}. Listen to the whispers of your heart, for they carry the keys to your liberation.`,
      
      `Through the lens of ${theme.toLowerCase()}, this card offers profound insight into your spiritual quest for ${intention || 'inner peace and understanding'}. ${spiritualSymbols ? `The energy of ${spiritualSymbols} weaves` : 'Sacred energy weaves'} through this message, creating a tapestry of meaning uniquely yours. ${inspiration ? `Inspired by the timeless wisdom of ${inspiration}, this card` : 'This card'} encourages you to honor both your light and shadow, recognizing that wholeness comes through integration and self-compassion.`
    ];
    
    // Select a random meaningful interpretation
    const randomMeaning = aiMeanings[Math.floor(Math.random() * aiMeanings.length)];
    
    return randomMeaning;
  };

  const handleGenerateWithAI = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a deck name');
      return;
    }

    setGenerating(true);

    try {
      const newDeck: Deck = {
        id: Date.now().toString(),
        name: name.trim(),
        description: `A spiritually guided deck focused on ${intention || 'personal growth'}`,
        cardCount: 0,
        createdAt: new Date().toISOString(),
        // Store user's spiritual input
        intention: intention.trim(),
        spiritualSymbols: spiritualSymbols.trim(),
        inspiration: inspiration.trim(),
        basePrompt: basePrompt.trim(),
      };

      decks.push(newDeck);

      // Generate diverse card themes based on spiritual archetypes
      const cardThemes = [
        'Sacred Awakening', 'Divine Connection', 'Inner Light', 'Peaceful Mind', 
        'Spiritual Growth', 'Intuitive Wisdom', 'Loving Kindness', 'Sacred Truth',
        'Soul Purpose', 'Divine Protection', 'Healing Energy', 'Abundant Blessings',
        'Sacred Journey', 'Inner Strength', 'Divine Guidance', 'Peaceful Heart',
        'Spiritual Transformation', 'Sacred Balance', 'Divine Love', 'Enlightened Action'
      ];

      // Shuffle and select unique themes
      const shuffledThemes = cardThemes.sort(() => Math.random() - 0.5);
      const selectedThemes = shuffledThemes.slice(0, parseInt(cardCount));
      
      // Generate each card with AI
      console.log('🤖 Generating AI cards with personalized content...');
      
      for (let index = 0; index < selectedThemes.length; index++) {
        const theme = selectedThemes[index];
        
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const aiGeneratedMeaning = await generateCardWithAI(theme, theme);
        
        const newCard: Card = {
          id: `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          deckId: newDeck.id,
          title: theme,
          meaning: aiGeneratedMeaning,
          position: index + 1,
        };
        
        cards.push(newCard);
        console.log(`✅ Generated card: ${theme}`);
      }

      console.log(`🎉 Deck generation complete! Created ${selectedThemes.length} unique cards.`);
      
      // Navigate directly to the new deck (fix #1)
      navigation.replace('DeckDetail', { deckId: newDeck.id });
      
    } catch (error) {
      console.error('Deck generation error:', error);
      Alert.alert('Error', 'Failed to generate deck. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>✨ AI Deck Generator</Text>
      <Text style={styles.description}>
        Tell AI about your spiritual journey and it will create a personalized oracle deck for you
      </Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Deck Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Spiritual Guidance, Daily Inspiration"
          maxLength={50}
        />
        
        <Text style={styles.label}>Your Intention & Purpose</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={intention}
          onChangeText={setIntention}
          placeholder="What do you hope to achieve with this deck? e.g., finding inner peace, making decisions, connecting with spirit guides..."
          multiline
          numberOfLines={3}
          maxLength={200}
        />
        
        <Text style={styles.label}>Spiritual Symbols & Themes</Text>
        <TextInput
          style={styles.input}
          value={spiritualSymbols}
          onChangeText={setSpiritualSymbols}
          placeholder="e.g., lotus, moon, crystals, angels, chakras, nature"
          maxLength={100}
        />
        
        <Text style={styles.label}>What Inspires You</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={inspiration}
          onChangeText={setInspiration}
          placeholder="Share what moves your spirit... wisdom traditions, personal experiences, spiritual practices..."
          multiline
          numberOfLines={3}
          maxLength={200}
        />
        
        <Text style={styles.label}>Number of Cards</Text>
        <TextInput
          style={styles.input}
          value={cardCount}
          onChangeText={setCardCount}
          placeholder="8"
          keyboardType="numeric"
          maxLength={2}
        />
        
        <View style={styles.aiNote}>
          <Text style={styles.aiNoteText}>
            🤖 AI will generate meaningful cards, titles, and interpretations based on your input
          </Text>
        </View>
        
        <View style={styles.formButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.createButton, generating && styles.disabledButton]}
            onPress={handleGenerateWithAI}
            disabled={generating}
          >
            <Text style={styles.createButtonText}>
              {generating ? '✨ Generating...' : '🔮 Generate Deck'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Deck Detail Screen - Shows cards in a deck
function DeckDetailScreen({ route, navigation }: any) {
  const { deckId } = route.params;
  const [refreshKey, setRefreshKey] = useState(0);
  
  const deck = decks.find(d => d.id === deckId);
  const deckCards = cards.filter(card => card.deckId === deckId);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefreshKey(prev => prev + 1);
    });
    return unsubscribe;
  }, [navigation]);

  if (!deck) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Deck not found</Text>
      </View>
    );
  }

  const handleDeleteCard = (cardId: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            cards = cards.filter(card => card.id !== cardId);
            setRefreshKey(prev => prev + 1);
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{deck.name}</Text>
      <Text style={styles.description}>{deck.description}</Text>
      <Text style={styles.subtitle}>{deckCards.length} cards</Text>
      
      {deckCards.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No cards yet</Text>
          <Text style={styles.emptyDesc}>Add your first card to this deck</Text>
        </View>
      ) : (
        deckCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.cardItem}
            onPress={() => navigation.navigate('CardEdit', { cardId: card.id, deckId: deck.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardMeaning} numberOfLines={2}>{card.meaning}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteCard(card.id);
              }}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
      
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('CardCreate', { deckId: deck.id })}
      >
        <Text style={styles.createButtonText}>+ Add Card</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Card Edit Screen
function CardEditScreen({ route, navigation }: any) {
  const { cardId, deckId } = route.params;
  const card = cards.find(c => c.id === cardId);
  
  const [title, setTitle] = useState(card?.title || '');
  const [meaning, setMeaning] = useState(card?.meaning || '');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a card title');
      return;
    }

    // Update the card
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex !== -1) {
      cards[cardIndex] = {
        ...cards[cardIndex],
        title: title.trim(),
        meaning: meaning.trim() || 'This card represents wisdom and guidance on your spiritual journey.'
      };
    }

    Alert.alert('Success', 'Card updated successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  if (!card) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Card not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Card</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Card Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., New Beginnings, Inner Wisdom"
          maxLength={50}
        />
        
        <Text style={styles.label}>Meaning & Interpretation</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={meaning}
          onChangeText={setMeaning}
          placeholder="Enter the spiritual meaning and guidance this card provides..."
          multiline
          numberOfLines={6}
          maxLength={500}
        />
        
        <View style={styles.aiNote}>
          <Text style={styles.aiNoteText}>
            🎨 Future: Generate AI artwork for this card
          </Text>
        </View>
        
        <View style={styles.formButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleSave}
          >
            <Text style={styles.createButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Card Creation Screen
function CardCreateScreen({ route, navigation }: any) {
  const { deckId } = route.params;
  const [title, setTitle] = useState('');
  const [meaning, setMeaning] = useState('');

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a card title');
      return;
    }

    const newCard: Card = {
      id: Date.now().toString(),
      deckId,
      title: title.trim(),
      meaning: meaning.trim() || 'This card represents wisdom and guidance on your spiritual journey.',
      position: cards.filter(c => c.deckId === deckId).length + 1,
    };

    cards.push(newCard);
    Alert.alert('Success', 'Card created successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Card</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Card Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., New Beginnings, Inner Wisdom"
          maxLength={50}
        />
        
        <Text style={styles.label}>Meaning & Interpretation</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={meaning}
          onChangeText={setMeaning}
          placeholder="Enter the spiritual meaning and guidance this card provides..."
          multiline
          numberOfLines={6}
          maxLength={500}
        />
        
        <View style={styles.aiNote}>
          <Text style={styles.aiNoteText}>
            💡 In the full version, AI will generate beautiful meanings and artwork for your cards
          </Text>
        </View>
        
        <View style={styles.formButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreate}
          >
            <Text style={styles.createButtonText}>Create Card</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Reading Screen (Simplified)
function ReadingScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔮 Oracle Reading</Text>
      <Text style={styles.description}>Choose a deck and spread type</Text>
      
      {decks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No decks available</Text>
          <Text style={styles.emptyDesc}>Create a deck with cards to start readings</Text>
        </View>
      ) : (
        <View style={styles.featureNote}>
          <Text style={styles.featureNoteText}>
            📚 You have {decks.length} deck(s) with {cards.length} total cards
          </Text>
          <Text style={styles.featureNoteText}>
            🔮 Reading functionality will be implemented next
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// Journal Screen (Simplified)
function JournalScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📖 Spiritual Journal</Text>
      <Text style={styles.description}>Record your insights and growth</Text>
      
      <View style={styles.featureNote}>
        <Text style={styles.featureNoteText}>
          📝 Journal functionality will be implemented after deck/card management
        </Text>
      </View>
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
          name="DeckList" 
          component={DeckListScreen} 
          options={{ title: 'My Decks' }}
        />
        <Stack.Screen 
          name="DeckCreate" 
          component={DeckCreateScreen} 
          options={{ title: 'Create Deck' }}
        />
        <Stack.Screen 
          name="DeckDetail" 
          component={DeckDetailScreen} 
          options={{ title: 'Deck Details' }}
        />
        <Stack.Screen 
          name="CardCreate" 
          component={CardCreateScreen} 
          options={{ title: 'Create Card' }}
        />
        <Stack.Screen 
          name="CardEdit" 
          component={CardEditScreen} 
          options={{ title: 'Edit Card' }}
        />
        <Stack.Screen 
          name="Reading" 
          component={ReadingScreen} 
          options={{ title: 'Oracle Reading' }}
        />
        <Stack.Screen 
          name="Journal" 
          component={JournalScreen} 
          options={{ title: 'Journal' }}
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
    marginBottom: 20,
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
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  deckCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  deckSubtitle: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 8,
    fontWeight: '500',
  },
  deckDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.45,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  cardMeaning: {
    fontSize: 14,
    color: '#64748b',
  },
  aiNote: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  aiNoteText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
  },
  featureNote: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  featureNoteText: {
    fontSize: 14,
    color: '#0369a1',
    textAlign: 'center',
    marginBottom: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  codeInput: {
    fontFamily: 'monospace',
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  detailsToggle: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  detailsToggleText: {
    color: '#3730a3',
    fontSize: 14,
    fontWeight: '600',
  },
  spiritualDetails: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#e5e7eb',
    padding: 8,
    borderRadius: 4,
  },
});