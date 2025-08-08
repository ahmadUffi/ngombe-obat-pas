# Register Form Validation Test Guide

## Testing Phone Validation Before User Creation

### Manual Testing Steps:

1. **Open Register Form**

   - Navigate to register page
   - Open browser console (F12)

2. **Test Real-time Validation:**

   **Valid Phone Numbers** (should show ✅):

   - `081234567890` → Should show "✓ 0812-3456-7890 [Telkomsel]"
   - `+6281434567890` → Should show "✓ +62 814-3456-7890 [Indosat]"
   - `817567890123` → Should show "✓ +62 817-5678-9012 [XL]"

   **Invalid Phone Numbers** (should show ❌):

   - `123456789` → "✗ Nomor telepon terlalu pendek"
   - `021567890` → "✗ Provider tidak valid"
   - `+62700567890123` → "✗ Gunakan nomor Indonesia"
   - Leave empty → "✗ Nomor telepon wajib diisi"

3. **Test Submit Button:**

   - Button should be DISABLED when:

     - Any field is empty
     - Phone validation shows ❌
     - Password doesn't match

   - Button should be ENABLED when:
     - All fields filled
     - Phone validation shows ✅
     - Passwords match

4. **Test Validation Before User Creation:**

   - Fill invalid phone (e.g., `123456789`)
   - Try to submit form
   - Should see console logs:
     ```
     🔍 Starting form validation...
     ✅ Basic validation passed, validating phone...
     📱 Phone to validate: 123456789
     📋 Phone validation result: {isValid: false, error: {...}}
     ❌ Phone validation failed: {...}
     ```
   - Should show toast error
   - Should NOT create user account
   - Form should remain on register page

5. **Test Successful Registration:**
   - Fill valid phone (e.g., `081234567890`)
   - Fill all other fields correctly
   - Submit form
   - Should see console logs:
     ```
     🔍 Starting form validation...
     ✅ Basic validation passed, validating phone...
     📱 Phone to validate: 081234567890
     📋 Phone validation result: {isValid: true, normalizedPhone: "6281234567890"}
     ✅ Phone validation passed! Normalized phone: 6281234567890
     🚀 All validations passed, proceeding to create user...
     ```
   - Should create user account
   - Should store normalized phone in database
   - Should redirect to login page

### Validation Status Indicator:

The form now shows a validation summary with:

- ✅/⭕ Email status
- ✅/⭕ Username status
- ✅/⭕ Password match status
- ✅/⭕ Phone validation status

### Expected Behavior:

1. **Before Any Input:**

   - All indicators show ⭕
   - Submit button is disabled

2. **As User Types:**

   - Phone field shows real-time validation
   - Visual indicators (✓/✗) update immediately
   - Format preview shows normalized phone
   - Provider detection shows carrier name

3. **When Form is Valid:**

   - All indicators show ✅
   - Submit button becomes enabled
   - Phone displays normalized format

4. **On Submit with Invalid Data:**

   - Validation runs before user creation
   - Shows specific error messages
   - Prevents account creation
   - Keeps user on register form

5. **On Submit with Valid Data:**
   - All validations pass
   - User account created successfully
   - Phone stored in normalized format (62xxx)
   - Redirects to login page

### Database Verification:

After successful registration, check the `profile` table:

- `no_hp` field should contain normalized phone (62xxx format)
- Not the original user input format

### Console Debugging:

Enable these logs in browser console:

- Form validation start/end
- Phone validation details
- Normalized phone number
- User creation confirmation
- Database insertion status

This ensures phone validation works properly before any user account is created.
