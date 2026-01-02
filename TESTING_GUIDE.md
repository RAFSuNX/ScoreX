# ScoreX Testing Guide - Phases 1 & 2

## Prerequisites
- Docker containers running (`docker compose ps`)
- Application accessible at http://localhost:3000
- Database with migrations applied

## Test Scenarios

### 🧪 TEST 1: User Authentication & Plans

**Objective:** Verify different user plan behaviors

#### Steps:
1. **Create FREE user account**
   - Go to http://localhost:3000/signup
   - Register with email/password
   - Should default to FREE plan

2. **Verify FREE user limitations**
   - Dashboard should be accessible
   - Navigate to http://localhost:3000/dashboard/bank
   - Should see upgrade prompt (not the question bank interface)
   - Verify "Upgrade to Pro" button is present

3. **Test PRO user (manual database update)**
   ```sql
   -- Update user to PRO plan in database
   UPDATE "User" SET plan = 'PRO' WHERE email = 'your-test-email@example.com';
   ```
   - Refresh browser
   - Navigate to /dashboard/bank
   - Should now see Question Bank management interface

---

### 🧪 TEST 2: Enhanced Question Types

**Objective:** Verify all question types render correctly in exam creation

#### Steps:
1. **Create exam with all question types**
   - Login as any user
   - Go to http://localhost:3000/dashboard/create
   - Select PDF or text source
   - In "Customize Your Exam" step:
     - Select all question types:
       - ✓ Multiple Choice
       - ✓ True/False
       - ✓ Fill in the Blank (should show PRO badge if FREE user)
       - ✓ Short Answer

2. **Test Pro badge behavior (as FREE user)**
   - Click on "Fill in the Blank" option
   - Should trigger UpgradeModal
   - Modal should show pricing comparison
   - Close modal and verify it doesn't select the option

3. **Test question type selection (as PRO user)**
   - All options should be selectable
   - No upgrade modal should appear
   - Should be able to select/deselect any combination

---

### 🧪 TEST 3: Question Bank - Create & Save

**Objective:** Test creating and saving questions to question bank

**Prerequisites:** User must be PRO or PREMIUM

#### Steps:
1. **Generate exam questions**
   - Create a new exam with text input:
     ```
     Python is a high-level programming language.
     It supports multiple programming paradigms including procedural,
     object-oriented, and functional programming.
     Variables in Python are dynamically typed.
     ```
   - Set difficulty: Medium
   - Question count: 5
   - Select question types

2. **Save to Question Bank (Manual - API Test)**
   ```bash
   # Test creating a question bank via API
   curl -X POST http://localhost:3000/api/question-bank \
     -H "Content-Type: application/json" \
     -H "Cookie: YOUR_SESSION_COOKIE" \
     -d '{
       "subject": "Programming",
       "title": "Python Basics",
       "questions": [
         {
           "questionText": "Python is a _____ typed language.",
           "questionType": "FILL_IN_THE_BLANK",
           "correctAnswer": "dynamically",
           "explanation": "Python uses dynamic typing.",
           "points": 1,
           "order": 0
         }
       ]
     }'
   ```

3. **Verify in Question Bank page**
   - Go to http://localhost:3000/dashboard/bank
   - Should see "Python Basics" bank
   - Subject should be "Programming"
   - Should show 1 question count

---

### 🧪 TEST 4: Question Bank - Edit Questions

**Objective:** Test editing questions in the question bank

#### Steps:
1. **Access Question Bank**
   - Go to http://localhost:3000/dashboard/bank
   - Click "View Questions" on a question bank

2. **Edit a question**
   - Click the edit icon (pencil) on a question
   - QuestionEditor modal should appear
   - Modify the question text
   - Change question type
   - Update explanation
   - Click "Save Changes"

3. **Verify changes**
   - Modal should close
   - Question should reload with updated text
   - Expand the bank again to confirm changes persisted

4. **Delete a question**
   - Click edit on a question
   - Click "Delete" button
   - Confirm deletion
   - Question should be removed from the list

---

### 🧪 TEST 5: Build Exam from Question Bank

**Objective:** Test creating exams using saved questions

#### Steps:
1. **Test API endpoint**
   ```bash
   # First, get question IDs from your bank
   curl http://localhost:3000/api/question-bank \
     -H "Cookie: YOUR_SESSION_COOKIE"

   # Then create exam from bank
   curl -X POST http://localhost:3000/api/exams/create \
     -H "Content-Type: application/json" \
     -H "Cookie: YOUR_SESSION_COOKIE" \
     -d '{
       "title": "Test Exam from Bank",
       "subject": "Programming",
       "difficulty": "MEDIUM",
       "sourceType": "QUESTION_BANK",
       "questionIds": ["question-id-1", "question-id-2"]
     }'
   ```

2. **Verify exam created**
   - Should return exam object with status 201
   - Exam should have `generationStatus: "COMPLETED"`
   - Questions should be copied from bank

---

### 🧪 TEST 6: Question Type Rendering

**Objective:** Verify all question types render correctly during exam

#### Steps:
1. **Take an exam with mixed question types**
   - Create/find exam with all question types
   - Go to exam taking page
   - Verify rendering for each type:

   **Multiple Choice:**
   - Should show A, B, C, D options
   - Clicking should highlight with checkmark
   - Options should be in rounded cards

   **True/False:**
   - Should show 2 options with radio buttons
   - Radio button should fill when selected
   - Should be in vertical layout

   **Fill in the Blank:**
   - Should show text input field
   - Should have placeholder text
   - Question should contain "_____"
   - Help text should appear below input

   **Short Answer:**
   - Should show textarea
   - Should have character counter
   - Should allow multiple lines

---

### 🧪 TEST 7: Pro Feature Enforcement

**Objective:** Verify Pro features are properly gated

#### Steps:
1. **As FREE user, test blocked features:**
   - Question Bank page → Should show upgrade prompt
   - Fill-in-the-Blank in exam config → Should show upgrade modal
   - API calls to `/api/question-bank` → Should return 403

2. **As PRO user, test allowed features:**
   - All above should work
   - Question limit: 500 questions max
   - Exam limit: 50/month

3. **Test API enforcement:**
   ```bash
   # As FREE user (should fail)
   curl -X POST http://localhost:3000/api/question-bank \
     -H "Content-Type: application/json" \
     -H "Cookie: FREE_USER_COOKIE" \
     -d '{"subject":"Test","title":"Test","questions":[]}'

   # Should return: {"message":"Question Bank is a Pro feature...","status":403}
   ```

---

### 🧪 TEST 8: Upgrade Modal

**Objective:** Test upgrade modal functionality

#### Steps:
1. **Trigger modal from different locations:**
   - Question Bank page (as FREE user)
   - Fill-in-the-Blank option (as FREE user)

2. **Verify modal content:**
   - Shows Pro plan ($19/month)
   - Shows Premium plan ($79/month)
   - Lists features correctly
   - "Current Plan" disabled if user already has plan
   - Close button works
   - Overlay click closes modal

---

## Test Results Checklist

### Phase 1: Question Bank Infrastructure
- [ ] Question Bank page accessible for PRO/PREMIUM users
- [ ] Upgrade prompt shown for FREE users
- [ ] Questions can be created via API
- [ ] Questions can be edited via QuestionEditor
- [ ] Questions can be deleted
- [ ] Question banks can be filtered by subject
- [ ] Search functionality works
- [ ] Exams can be built from question bank
- [ ] Question limit enforced (500 for PRO)

### Phase 2: Enhanced Question Types
- [ ] Fill-in-the-Blank option shows PRO badge
- [ ] FREE users see upgrade modal when clicking Fill-in-the-Blank
- [ ] PRO users can select Fill-in-the-Blank
- [ ] Multiple Choice renders with checkboxes
- [ ] True/False renders with radio buttons
- [ ] Fill-in-the-Blank renders with text input
- [ ] Short Answer renders with textarea
- [ ] All question types can be answered
- [ ] AI generates Fill-in-the-Blank questions correctly

### General
- [ ] No console errors
- [ ] UI is responsive on mobile
- [ ] Loading states work correctly
- [ ] Error messages are clear and helpful
- [ ] Session persists across page refreshes

---

## Known Issues to Check

1. **Session/Auth Issues:**
   - Verify `session.user.plan` is accessible in components
   - Check NextAuth configuration includes plan in session

2. **Type Mismatches:**
   - Question types should match between frontend and backend
   - Enum values should be consistent (FILL_IN_THE_BLANK vs fill-in-the-blank)

3. **Database:**
   - Migrations applied correctly
   - No orphaned questions (questionBankId and examId both null)

---

## Quick Test Commands

```bash
# Check Docker status
docker compose ps

# View application logs
docker compose logs -f scorex

# Check database
docker compose exec postgres psql -U scorex_user -d scorex_db -c "SELECT plan, COUNT(*) FROM \"User\" GROUP BY plan;"

# Verify migrations
docker compose exec postgres psql -U scorex_user -d scorex_db -c "SELECT * FROM \"_prisma_migrations\" ORDER BY finished_at DESC LIMIT 5;"

# Count question banks
docker compose exec postgres psql -U scorex_user -d scorex_db -c "SELECT COUNT(*) FROM \"QuestionBank\";"
```

---

## Reporting Issues

If you find issues during testing:

1. **Document:**
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable
   - Browser console errors

2. **Check logs:**
   ```bash
   docker compose logs scorex | grep -i error
   ```

3. **Database state:**
   ```bash
   # Check user plans
   docker compose exec postgres psql -U scorex_user -d scorex_db -c "SELECT email, plan FROM \"User\";"
   ```

---

## Ready for Phase 3?

Once all tests pass, we're ready to implement:
- ✅ Flashcard Mode (Pro Feature)
- ✅ Export & Share Results
- ✅ Payment Integration (Stripe)
