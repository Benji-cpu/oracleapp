/**
 * Oracle Card Creator - User Flow Integration Tests
 * 
 * These tests simulate complete user journeys through the app,
 * testing all major functionality including:
 * - Deck creation with AI generation
 * - Card viewing and editing
 * - Navigation between screens
 * - Data persistence
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

// Import the main App component
import App from '../App';

// Mock Alert to capture calls
jest.spyOn(Alert, 'alert');

const Stack = createNativeStackNavigator();

// Test wrapper that provides navigation context
const TestWrapper = ({ children }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Test" component={() => children} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Oracle Card Creator - Complete User Flows', () => {
  beforeEach(() => {
    // Clear any existing data before each test
    jest.clearAllMocks();
    // Reset global state
    global.decks = [];
    global.cards = [];
  });

  describe('User Flow 1: Complete Deck Creation & Management', () => {
    test('should allow user to create deck, view cards, and edit cards', async () => {
      const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(<App />);

      // Step 1: Start from home screen
      expect(getByText('🔮 Oracle Card Creator')).toBeTruthy();
      expect(getByText('📚 My Decks (0)')).toBeTruthy();

      // Step 2: Navigate to deck list
      fireEvent.press(getByText('📚 My Decks (0)'));
      
      await waitFor(() => {
        expect(getByText('📚 My Decks')).toBeTruthy();
        expect(getByText('No decks yet')).toBeTruthy();
      });

      // Step 3: Start deck creation
      fireEvent.press(getByText('+ Create New Deck'));
      
      await waitFor(() => {
        expect(getByText('✨ AI Deck Generator')).toBeTruthy();
      });

      // Step 4: Fill out AI deck generation form
      const nameInput = getByPlaceholderText('e.g., Spiritual Guidance, Daily Inspiration');
      const intentionInput = getByPlaceholderText(/What do you hope to achieve/);
      const symbolsInput = getByPlaceholderText('e.g., lotus, moon, crystals, angels, chakras, nature');
      const inspirationInput = getByPlaceholderText(/Share what moves your spirit/);
      const cardCountInput = getByPlaceholderText('8');

      fireEvent.changeText(nameInput, 'Test Wisdom Deck');
      fireEvent.changeText(intentionInput, 'Finding inner peace and clarity in daily decisions');
      fireEvent.changeText(symbolsInput, 'lotus, moon, crystals');
      fireEvent.changeText(inspirationInput, 'Ancient wisdom traditions and meditation practices');
      fireEvent.changeText(cardCountInput, '5');

      // Step 5: Generate deck with AI
      const generateButton = getByText('🔮 Generate Deck');
      fireEvent.press(generateButton);

      // Verify loading state
      await waitFor(() => {
        expect(getByText('✨ Generating...')).toBeTruthy();
      });

      // Wait for generation to complete (2 second timeout in app)
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          '✨ Deck Generated!',
          'Your "Test Wisdom Deck" deck has been created with 5 AI-generated cards!',
          expect.any(Array)
        );
      }, { timeout: 3000 });

      // Step 6: Simulate pressing "View Deck" in the alert
      const alertCall = Alert.alert.mock.calls[0];
      const viewDeckCallback = alertCall[2][0].onPress;
      act(() => {
        viewDeckCallback();
      });

      // Step 7: Verify we're now in deck detail view
      await waitFor(() => {
        expect(getByText('Test Wisdom Deck')).toBeTruthy();
        expect(getByText(/A spiritually guided deck focused on/)).toBeTruthy();
        expect(getByText('5 cards')).toBeTruthy();
      });

      // Step 8: Verify cards were generated
      await waitFor(() => {
        expect(queryByText('New Beginnings')).toBeTruthy();
        expect(queryByText('Inner Wisdom')).toBeTruthy();
        expect(queryByText('Spiritual Growth')).toBeTruthy();
        expect(queryByText('Divine Guidance')).toBeTruthy();
        expect(queryByText('Transformation')).toBeTruthy();
      });

      // Step 9: Edit a card
      const firstCard = getByText('New Beginnings');
      fireEvent.press(firstCard);

      await waitFor(() => {
        expect(getByText('Edit Card')).toBeTruthy();
      });

      // Step 10: Modify card content
      const cardTitleInput = getByPlaceholderText('e.g., New Beginnings, Inner Wisdom');
      const cardMeaningInput = getByPlaceholderText(/Enter the spiritual meaning/);

      fireEvent.changeText(cardTitleInput, 'Fresh Starts');
      fireEvent.changeText(cardMeaningInput, 'This card represents the energy of new beginnings and the courage to start fresh on your spiritual path.');

      // Step 11: Save changes
      fireEvent.press(getByText('Save Changes'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Card updated successfully!',
          expect.any(Array)
        );
      });

      // Step 12: Simulate pressing OK to go back
      const saveAlertCall = Alert.alert.mock.calls.find(call => call[1] === 'Card updated successfully!');
      const okCallback = saveAlertCall[2][0].onPress;
      act(() => {
        okCallback();
      });

      // Step 13: Verify we're back in deck detail and changes persisted
      await waitFor(() => {
        expect(getByText('Fresh Starts')).toBeTruthy();
        expect(queryByText('New Beginnings')).toBeFalsy();
      });
    });
  });

  describe('User Flow 2: Multiple Deck Management', () => {
    test('should handle creating multiple decks and navigation between them', async () => {
      const { getByText, getByPlaceholderText } = render(<App />);

      // Create first deck
      fireEvent.press(getByText('📚 My Decks (0)'));
      fireEvent.press(getByText('+ Create New Deck'));

      const nameInput1 = getByPlaceholderText('e.g., Spiritual Guidance, Daily Inspiration');
      fireEvent.changeText(nameInput1, 'Morning Meditation Deck');
      fireEvent.press(getByText('🔮 Generate Deck'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Go back to deck list
      fireEvent.press(getByText('My Decks')); // Header back button

      // Create second deck
      fireEvent.press(getByText('+ Create New Deck'));
      
      const nameInput2 = getByPlaceholderText('e.g., Spiritual Guidance, Daily Inspiration');
      fireEvent.changeText(nameInput2, 'Evening Reflection Deck');
      fireEvent.press(getByText('🔮 Generate Deck'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledTimes(2);
      }, { timeout: 3000 });

      // Verify both decks exist in list
      fireEvent.press(getByText('My Decks'));
      
      await waitFor(() => {
        expect(getByText('Morning Meditation Deck')).toBeTruthy();
        expect(getByText('Evening Reflection Deck')).toBeTruthy();
      });
    });
  });

  describe('User Flow 3: Card Management Operations', () => {
    test('should allow adding new cards manually and deleting cards', async () => {
      const { getByText, getByPlaceholderText } = render(<App />);

      // Create a deck first
      fireEvent.press(getByText('📚 My Decks (0)'));
      fireEvent.press(getByText('+ Create New Deck'));
      
      const nameInput = getByPlaceholderText('e.g., Spiritual Guidance, Daily Inspiration');
      fireEvent.changeText(nameInput, 'Test Deck');
      fireEvent.press(getByText('🔮 Generate Deck'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Navigate to deck (simulate alert callback)
      const alertCall = Alert.alert.mock.calls[0];
      const viewDeckCallback = alertCall[2][0].onPress;
      act(() => {
        viewDeckCallback();
      });

      // Add a manual card
      await waitFor(() => {
        expect(getByText('+ Add Card')).toBeTruthy();
      });

      fireEvent.press(getByText('+ Add Card'));

      await waitFor(() => {
        expect(getByText('Create New Card')).toBeTruthy();
      });

      // Fill out manual card
      const cardTitleInput = getByPlaceholderText('e.g., New Beginnings, Inner Wisdom');
      const cardMeaningInput = getByPlaceholderText(/Enter the spiritual meaning/);

      fireEvent.changeText(cardTitleInput, 'Custom Wisdom');
      fireEvent.changeText(cardMeaningInput, 'A manually created card with personal meaning.');

      fireEvent.press(getByText('Create Card'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Card created successfully!',
          expect.any(Array)
        );
      });

      // Go back to deck detail
      const createAlertCall = Alert.alert.mock.calls.find(call => call[1] === 'Card created successfully!');
      const okCallback = createAlertCall[2][0].onPress;
      act(() => {
        okCallback();
      });

      // Verify new card appears
      await waitFor(() => {
        expect(getByText('Custom Wisdom')).toBeTruthy();
      });

      // Test card deletion
      const deleteButtons = getByText('🗑️');
      fireEvent.press(deleteButtons);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Delete Card',
          'Are you sure you want to delete this card?',
          expect.any(Array)
        );
      });
    });
  });

  describe('User Flow 4: Error Handling and Validation', () => {
    test('should handle form validation and empty states correctly', async () => {
      const { getByText, getByPlaceholderText } = render(<App />);

      // Test deck creation without name
      fireEvent.press(getByText('📚 My Decks (0)'));
      fireEvent.press(getByText('+ Create New Deck'));
      
      // Try to create without entering name
      fireEvent.press(getByText('🔮 Generate Deck'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please enter a deck name'
        );
      });

      // Test card creation without title
      const nameInput = getByPlaceholderText('e.g., Spiritual Guidance, Daily Inspiration');
      fireEvent.changeText(nameInput, 'Valid Deck Name');
      fireEvent.press(getByText('🔮 Generate Deck'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Navigate to deck
      const alertCall = Alert.alert.mock.calls.find(call => call[0] === '✨ Deck Generated!');
      const viewDeckCallback = alertCall[2][0].onPress;
      act(() => {
        viewDeckCallback();
      });

      // Try to add card without title
      fireEvent.press(getByText('+ Add Card'));
      fireEvent.press(getByText('Create Card'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please enter a card title'
        );
      });
    });
  });
});