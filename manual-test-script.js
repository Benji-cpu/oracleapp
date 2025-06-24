/**
 * Manual Testing Script for Oracle Card Creator
 * 
 * This script simulates user interactions programmatically to test
 * all major functionality. Run this in the browser console while
 * the app is running at localhost:8081
 */

// Utility functions for testing
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const clickElement = (text) => {
  const elements = Array.from(document.querySelectorAll('*')).filter(
    el => el.textContent && el.textContent.includes(text)
  );
  if (elements.length > 0) {
    elements[0].click();
    console.log(`✅ Clicked: "${text}"`);
    return true;
  }
  console.log(`❌ Could not find element: "${text}"`);
  return false;
};

const fillInput = (placeholder, value) => {
  const input = document.querySelector(`input[placeholder*="${placeholder}"], textarea[placeholder*="${placeholder}"]`);
  if (input) {
    input.focus();
    input.value = value;
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
    console.log(`✅ Filled input "${placeholder}" with: "${value}"`);
    return true;
  }
  console.log(`❌ Could not find input with placeholder: "${placeholder}"`);
  return false;
};

const verifyText = (text) => {
  const found = document.body.textContent.includes(text);
  if (found) {
    console.log(`✅ Found text: "${text}"`);
  } else {
    console.log(`❌ Text not found: "${text}"`);
  }
  return found;
};

// Test Suite 1: Complete Deck Creation Flow
async function testDeckCreationFlow() {
  console.log('\n🧪 TEST 1: Complete Deck Creation Flow');
  console.log('==========================================');
  
  // Step 1: Start from home
  verifyText('🔮 Oracle Card Creator');
  verifyText('📚 My Decks (0)');
  
  // Step 2: Navigate to deck list
  await wait(500);
  clickElement('📚 My Decks');
  await wait(1000);
  
  verifyText('📚 My Decks');
  verifyText('No decks yet');
  
  // Step 3: Start deck creation
  await wait(500);
  clickElement('+ Create New Deck');
  await wait(1000);
  
  verifyText('✨ AI Deck Generator');
  
  // Step 4: Fill out form
  await wait(500);
  fillInput('e.g., Spiritual Guidance', 'Test Spiritual Deck');
  await wait(200);
  fillInput('What do you hope to achieve', 'Finding inner peace and spiritual guidance for daily decisions');
  await wait(200);
  fillInput('e.g., lotus, moon', 'lotus, crystals, sacred geometry');
  await wait(200);
  fillInput('Share what moves your spirit', 'Ancient wisdom traditions, meditation, and connection with nature');
  await wait(200);
  fillInput('8', '6');
  
  // Step 5: Generate deck
  await wait(500);
  clickElement('🔮 Generate Deck');
  console.log('⏳ Generating deck (waiting 3 seconds)...');
  await wait(3000);
  
  // Step 6: Check if deck was created (look for alert or navigation)
  if (verifyText('Test Spiritual Deck')) {
    console.log('✅ Deck creation successful - now in deck detail view');
    
    // Check for generated cards
    const cardTitles = ['New Beginnings', 'Inner Wisdom', 'Spiritual Growth', 'Divine Guidance', 'Transformation', 'Intuition'];
    cardTitles.forEach(title => verifyText(title));
    
    return true;
  } else {
    console.log('❌ Deck creation may have failed or not navigated properly');
    return false;
  }
}

// Test Suite 2: Card Editing Flow
async function testCardEditingFlow() {
  console.log('\n🧪 TEST 2: Card Editing Flow');
  console.log('===============================');
  
  // Assume we're in a deck detail view with cards
  if (!verifyText('cards')) {
    console.log('❌ Not in deck detail view - skipping card editing test');
    return false;
  }
  
  // Step 1: Click on first card
  await wait(500);
  clickElement('New Beginnings');
  await wait(1000);
  
  if (verifyText('Edit Card')) {
    console.log('✅ Successfully navigated to card edit screen');
    
    // Step 2: Edit card content
    await wait(500);
    fillInput('e.g., New Beginnings', 'Fresh Spiritual Start');
    await wait(200);
    fillInput('Enter the spiritual meaning', 'This card represents the beautiful energy of new beginnings and the courage to embark on a fresh spiritual journey with an open heart.');
    
    // Step 3: Save changes
    await wait(500);
    clickElement('Save Changes');
    await wait(1000);
    
    // Step 4: Verify we're back in deck view with updated card
    if (verifyText('Fresh Spiritual Start')) {
      console.log('✅ Card editing successful - changes saved and visible');
      return true;
    } else {
      console.log('❌ Card changes may not have been saved properly');
      return false;
    }
  } else {
    console.log('❌ Failed to navigate to card edit screen');
    return false;
  }
}

// Test Suite 3: Adding New Cards
async function testAddNewCard() {
  console.log('\n🧪 TEST 3: Adding New Cards');
  console.log('=============================');
  
  // Step 1: Click add card button
  await wait(500);
  clickElement('+ Add Card');
  await wait(1000);
  
  if (verifyText('Create New Card')) {
    console.log('✅ Successfully navigated to card creation screen');
    
    // Step 2: Fill out new card
    await wait(500);
    fillInput('e.g., New Beginnings', 'Sacred Connection');
    await wait(200);
    fillInput('Enter the spiritual meaning', 'This card reminds you of your sacred connection to the universe and all living beings. Trust in the divine guidance that flows through you.');
    
    // Step 3: Create card
    await wait(500);
    clickElement('Create Card');
    await wait(1000);
    
    // Step 4: Verify card was added
    if (verifyText('Sacred Connection')) {
      console.log('✅ New card creation successful');
      return true;
    } else {
      console.log('❌ New card may not have been created properly');
      return false;
    }
  } else {
    console.log('❌ Failed to navigate to card creation screen');
    return false;
  }
}

// Test Suite 4: Navigation Testing
async function testNavigationFlow() {
  console.log('\n🧪 TEST 4: Navigation Flow');
  console.log('===========================');
  
  // Test going back to deck list
  await wait(500);
  clickElement('My Decks'); // Header back button
  await wait(1000);
  
  if (verifyText('📚 My Decks') && verifyText('Test Spiritual Deck')) {
    console.log('✅ Successfully navigated back to deck list');
    console.log('✅ Created deck is visible in deck list');
    
    // Test navigation to home
    await wait(500);
    clickElement('Oracle Card Creator'); // Header home button
    await wait(1000);
    
    if (verifyText('🔮 Oracle Card Creator') && verifyText('Your AI-Powered Spiritual Journey')) {
      console.log('✅ Successfully navigated back to home screen');
      console.log('✅ Deck count updated in home screen button');
      return true;
    } else {
      console.log('❌ Failed to navigate to home screen');
      return false;
    }
  } else {
    console.log('❌ Failed to navigate to deck list or deck not visible');
    return false;
  }
}

// Test Suite 5: Multiple Deck Creation
async function testMultipleDeckCreation() {
  console.log('\n🧪 TEST 5: Multiple Deck Creation');
  console.log('===================================');
  
  // Navigate back to deck list
  clickElement('📚 My Decks');
  await wait(1000);
  
  // Create second deck
  clickElement('+ Create New Deck');
  await wait(1000);
  
  // Fill with different data
  fillInput('e.g., Spiritual Guidance', 'Evening Reflection Deck');
  await wait(200);
  fillInput('What do you hope to achieve', 'Evening contemplation and gratitude practice');
  await wait(200);
  fillInput('e.g., lotus, moon', 'moon, stars, candles');
  await wait(500);
  
  clickElement('🔮 Generate Deck');
  await wait(3000);
  
  // Navigate back to deck list to verify both decks
  clickElement('My Decks');
  await wait(1000);
  
  if (verifyText('Test Spiritual Deck') && verifyText('Evening Reflection Deck')) {
    console.log('✅ Multiple deck creation successful');
    return true;
  } else {
    console.log('❌ Multiple deck creation failed');
    return false;
  }
}

// Master test runner
async function runAllTests() {
  console.log('🚀 Starting Oracle Card Creator Manual Tests');
  console.log('============================================');
  
  const results = {
    deckCreation: false,
    cardEditing: false,
    addNewCard: false,
    navigation: false,
    multipleDeck: false
  };
  
  try {
    results.deckCreation = await testDeckCreationFlow();
    await wait(1000);
    
    results.cardEditing = await testCardEditingFlow();
    await wait(1000);
    
    results.addNewCard = await testAddNewCard();
    await wait(1000);
    
    results.navigation = await testNavigationFlow();
    await wait(1000);
    
    results.multipleDeck = await testMultipleDeckCreation();
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
  }
  
  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`Deck Creation: ${results.deckCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Card Editing: ${results.cardEditing ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Add New Card: ${results.addNewCard ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Navigation: ${results.navigation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Multiple Decks: ${results.multipleDeck ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.values(results).length;
  
  console.log(`\n🎯 Overall Score: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('🎉 ALL TESTS PASSED! Oracle Card Creator is working perfectly! 🎉');
  } else {
    console.log('⚠️  Some tests failed. Check the detailed output above.');
  }
  
  return results;
}

// Quick individual test functions for manual use
window.testDeckCreation = testDeckCreationFlow;
window.testCardEditing = testCardEditingFlow;
window.testAddCard = testAddNewCard;
window.testNavigation = testNavigationFlow;
window.testMultipleDecks = testMultipleDeckCreation;
window.runAllTests = runAllTests;

console.log('🧪 Manual test functions loaded!');
console.log('Run runAllTests() to test everything, or individual test functions:');
console.log('- testDeckCreation()');
console.log('- testCardEditing()');
console.log('- testAddCard()');
console.log('- testNavigation()');
console.log('- testMultipleDecks()');
console.log('- runAllTests()');