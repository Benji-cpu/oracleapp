# Oracle Card Creator - Complete Test Plan

## 🧪 Manual Testing Instructions

### Prerequisites
1. App running at http://localhost:8081
2. Browser console open (F12)
3. Copy and paste the contents of `manual-test-script.js` into console

### Quick Test Commands
```javascript
// Run all tests automatically
runAllTests()

// Or run individual tests
testDeckCreation()
testCardEditing() 
testAddCard()
testNavigation()
testMultipleDecks()
```

## 📋 Manual Test Scenarios

### Test 1: AI Deck Creation Flow ✨
**Goal:** Verify complete deck creation with AI generation

**Steps:**
1. Start from home screen (verify "Oracle Card Creator" title)
2. Click "📚 My Decks (0)" 
3. Verify "No decks yet" message
4. Click "+ Create New Deck"
5. Fill out AI generation form:
   - Name: "Test Spiritual Deck"
   - Intention: "Finding inner peace and spiritual guidance"
   - Symbols: "lotus, crystals, sacred geometry"
   - Inspiration: "Ancient wisdom traditions"
   - Card Count: "6"
6. Click "🔮 Generate Deck"
7. Wait 2-3 seconds for generation
8. Verify success alert appears
9. Click "View Deck" in alert
10. Verify deck detail screen shows:
    - Deck name "Test Spiritual Deck"
    - "6 cards" count
    - Generated cards: "New Beginnings", "Inner Wisdom", etc.

**Expected Results:**
- ✅ Smooth navigation flow
- ✅ Form validation works
- ✅ AI generation creates 6 cards
- ✅ Cards have meaningful titles and descriptions
- ✅ Navigation to deck detail works

---

### Test 2: Card Editing Flow 📝
**Goal:** Verify users can edit existing cards

**Prerequisites:** Complete Test 1 first

**Steps:**
1. From deck detail screen, click on "New Beginnings" card
2. Verify "Edit Card" screen loads
3. Change title to "Fresh Spiritual Start"
4. Update meaning to custom text
5. Click "Save Changes"
6. Verify success alert
7. Click "OK" to return
8. Verify updated card shows in deck with new title

**Expected Results:**
- ✅ Card editing screen loads properly
- ✅ Form fields populate with existing data
- ✅ Changes save successfully
- ✅ Updated content persists and displays

---

### Test 3: Manual Card Creation 🃏
**Goal:** Verify users can add new cards manually

**Prerequisites:** In a deck detail screen

**Steps:**
1. Click "+ Add Card" button
2. Verify "Create New Card" screen
3. Fill in:
   - Title: "Sacred Connection"
   - Meaning: Custom spiritual message
4. Click "Create Card"
5. Verify success alert
6. Return to deck detail
7. Verify new card appears in deck

**Expected Results:**
- ✅ Manual card creation works
- ✅ Form validation prevents empty titles
- ✅ New cards appear immediately
- ✅ Card count updates

---

### Test 4: Navigation & Multiple Decks 🧭
**Goal:** Test navigation between screens and multiple deck management

**Steps:**
1. Create first deck (use Test 1)
2. Navigate back to deck list via header
3. Verify deck appears in list
4. Create second deck with different data:
   - Name: "Evening Reflection Deck"
   - Different spiritual focus
5. Verify both decks in list
6. Test navigation between:
   - Home → Deck List → Deck Detail → Card Edit
   - Back navigation works at each level
7. Verify deck count updates in home screen

**Expected Results:**
- ✅ Multiple decks can be created
- ✅ All navigation paths work
- ✅ Back buttons function correctly
- ✅ State persists between screens

---

### Test 5: Data Persistence 💾
**Goal:** Verify data persists during session

**Steps:**
1. Create deck with cards
2. Edit several cards
3. Navigate away and back
4. Refresh browser page
5. Navigate back to deck
6. Verify all changes persisted

**Expected Results:**
- ✅ Data survives navigation
- ✅ Edits are maintained
- ✅ Global state works correctly

---

### Test 6: Error Handling & Validation ⚠️
**Goal:** Test form validation and error states

**Steps:**
1. Try creating deck without name
2. Try creating card without title
3. Verify error alerts appear
4. Test with various invalid inputs
5. Verify proper error messages

**Expected Results:**
- ✅ Form validation prevents submission
- ✅ Clear error messages shown
- ✅ User can correct and resubmit

---

### Test 7: UI/UX Responsiveness 📱
**Goal:** Test responsive design and user experience

**Steps:**
1. Test on different browser window sizes
2. Verify touch targets are adequate
3. Check text readability
4. Test scrolling in long lists
5. Verify loading states during AI generation

**Expected Results:**
- ✅ UI adapts to screen size
- ✅ All elements accessible
- ✅ Loading indicators clear
- ✅ Smooth transitions

---

## 🎯 Success Criteria

### Core Functionality
- [ ] Users can create AI-generated decks
- [ ] Cards can be viewed and edited
- [ ] Manual card creation works
- [ ] Navigation flows smoothly
- [ ] Data persists correctly

### User Experience
- [ ] Intuitive interface
- [ ] Clear feedback on actions
- [ ] Proper error handling
- [ ] Responsive design
- [ ] Fast load times

### AI Integration
- [ ] AI deck generation completes successfully
- [ ] Generated cards have meaningful content
- [ ] User input influences generation
- [ ] Appropriate loading states

## 🚀 Automated Test Execution

### Browser Console Method
1. Open http://localhost:8081
2. Open browser console (F12)
3. Copy/paste `manual-test-script.js` content
4. Run: `runAllTests()`
5. Review console output for pass/fail results

### Individual Test Functions
```javascript
// Test specific functionality
testDeckCreation()    // Tests AI deck generation
testCardEditing()     // Tests card modification
testAddCard()         // Tests manual card creation
testNavigation()      // Tests screen transitions
testMultipleDecks()   // Tests multiple deck handling
```

## 📊 Test Results Template

Copy and fill out after testing:

```
🧪 ORACLE CARD CREATOR TEST RESULTS
===================================
Test Date: ___________
Tester: ___________

✅/❌ AI Deck Creation: ________
✅/❌ Card Editing: ________  
✅/❌ Manual Card Addition: ________
✅/❌ Navigation Flow: ________
✅/❌ Multiple Deck Management: ________
✅/❌ Data Persistence: ________
✅/❌ Error Handling: ________
✅/❌ UI Responsiveness: ________

Overall Score: ___/8 tests passed

Notes:
_________________________________
_________________________________
```

## 🔧 Troubleshooting

### Common Issues
- **App won't load:** Check if Expo server is running
- **Functions not found:** Re-paste manual-test-script.js
- **Navigation fails:** Verify all screens render correctly
- **Data loss:** Check browser console for errors

### Debug Commands
```javascript
// Check current app state
console.log('Decks:', window.decks || 'Not available');
console.log('Cards:', window.cards || 'Not available');

// Verify page elements
console.log('Current screen:', document.title);
console.log('Visible text:', document.body.textContent.substring(0, 200));
```