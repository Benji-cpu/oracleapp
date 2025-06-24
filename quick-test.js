// Quick verification that the app is working properly
// Run this in browser console at localhost:8081

function quickFunctionalityTest() {
  console.log('🧪 Running Quick Oracle Card Creator Test...');
  
  // Check if app loaded
  const hasTitle = document.body.textContent.includes('🔮 Oracle Card Creator');
  const hasDecksButton = document.body.textContent.includes('📚 My Decks');
  const hasCreateButton = document.body.textContent.includes('Start Reading');
  
  console.log(`App Title Present: ${hasTitle ? '✅' : '❌'}`);
  console.log(`Decks Button Present: ${hasDecksButton ? '✅' : '❌'}`);
  console.log(`Reading Button Present: ${hasCreateButton ? '✅' : '❌'}`);
  
  // Check if we can access deck management
  const deckButton = Array.from(document.querySelectorAll('*')).find(
    el => el.textContent && el.textContent.includes('📚 My Decks')
  );
  
  if (deckButton) {
    console.log('✅ Found deck management button');
    return {
      appLoaded: hasTitle,
      buttonsPresent: hasDecksButton && hasCreateButton,
      canTest: true
    };
  } else {
    console.log('❌ Cannot find deck management button');
    return {
      appLoaded: hasTitle,
      buttonsPresent: false,
      canTest: false
    };
  }
}

// Run the test
const result = quickFunctionalityTest();

if (result.canTest) {
  console.log('🎉 App appears to be working! Ready for full testing.');
  console.log('📋 Next steps:');
  console.log('1. Click "📚 My Decks" to test deck management');
  console.log('2. Try creating a new deck with AI generation');
  console.log('3. Test card editing functionality');
} else {
  console.log('⚠️ App may have loading issues. Check console for errors.');
}

window.quickTest = quickFunctionalityTest;