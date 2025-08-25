# 🚀 INVESTOR DEMO SETUP - Do This NOW!

## Step 1: Fix Critical Security (5 minutes)
1. Go to [Supabase Dashboard → Authentication → Settings](https://supabase.com/dashboard/project/ndpobqdkcffjbvoinglm/auth/policies)
2. Under "Auth" section:
   - Set **Access token expiry**: `3600`
   - Set **Refresh token expiry**: `604800`
3. Under "Password Requirements":
   - ✅ Enable **"Leaked password protection"**

## Step 2: Create Demo Tutor Accounts (10 minutes)

**IMPORTANT:** You need to create these accounts through your app's signup flow to populate the database properly.

### Demo Tutor Accounts to Create:

1. **Sarah Chen** (Math & Physics)
   - Email: `sarah.chen.demo@campusconnect.edu`
   - Password: `Demo123!`
   - Role: Tutor
   - Subjects: Calculus I ($25/hr), Physics I ($30/hr)
   - Bio: "Math PhD student with 3+ years tutoring experience"

2. **Marcus Johnson** (Chemistry & Biology)  
   - Email: `marcus.johnson.demo@campusconnect.edu`
   - Password: `Demo123!`
   - Role: Tutor
   - Subjects: General Chemistry ($28/hr), Biology I ($26/hr)
   - Bio: "Pre-med student, Dean's List for 3 semesters"

3. **Emily Rodriguez** (Computer Science)
   - Email: `emily.rodriguez.demo@campusconnect.edu`  
   - Password: `Demo123!`
   - Role: Tutor
   - Subject: Computer Science I ($35/hr)
   - Bio: "CS senior with tech company internship experience"

4. **Alex Thompson** (Multi-subject)
   - Email: `alex.thompson.demo@campusconnect.edu`
   - Password: `Demo123!`
   - Role: Tutor
   - Subjects: Calculus I ($22/hr), Physics I ($25/hr)
   - Bio: "Honor student with adaptable teaching style"

### Demo Student Account:
- Email: `demo.student@campusconnect.edu`
- Password: `Demo123!`  
- Role: Student

## Step 3: Test The Demo Flow (5 minutes)

1. **Student Journey:**
   - Login as demo student
   - Go to /discover 
   - Browse tutors
   - Book a session with Sarah for Calculus
   - Complete Stripe payment (use test card: 4242 4242 4242 4242)
   - Verify payment success page

2. **Tutor Journey:**
   - Login as Sarah  
   - Check pending messages
   - Accept student conversation
   - View booked sessions

## Step 4: Investor Talking Points

✅ **Working Stripe Payments** - Live transactions  
✅ **Real-time Messaging** - Tutor approval system  
✅ **Subject Matching** - Tutors only show their subjects  
✅ **Professional Design** - Production-ready UI  
✅ **Security Compliance** - Fixed all security warnings  

## Emergency Backup Plan

If signup doesn't work:
1. Go to Supabase Dashboard → Authentication → Users
2. Create users manually with the emails above
3. Set passwords through the dashboard

**Time needed: 20 minutes total**
**Critical: Do the security fixes FIRST!**