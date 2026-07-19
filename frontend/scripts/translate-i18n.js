const fs = require('fs');
const path = require('path');

const viPath = path.join(__dirname, '../messages/vi.json');
const enPath = path.join(__dirname, '../messages/en.json');

const viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));

// A mapping of common translations to English
const commonTranslations = {
  // Metadata
  "siteTitle": "Hoc Tu Thien",
  "siteDescription": "Education and charity platform — Connecting knowledge, spreading love.",
  "loginTitle": "Login | Hoc Tu Thien",
  "loginDescription": "Sign in to access your Hoc Tu Thien account.",
  "registerTitle": "Register | Hoc Tu Thien",
  "registerDescription": "Create your Hoc Tu Thien account.",
  "ogAlt": "Hoc Tu Thien - Connecting knowledge",

  // Common
  "brandName": "Hoc Tu Thien",
  "home": "Home",
  "courses": "Courses",
  "mentorship": "Mentorship",
  "aboutUs": "About Us",
  "campaigns": "Campaigns",
  "leaderboard": "Leaderboard",
  "transparency": "Financial Transparency",
  "getStarted": "Get Started",
  "learnMore": "Learn More",
  "subscribe": "Subscribe",
  "emailPlaceholder": "Enter your email",
  "company": "Company",
  "support": "Support",
  "legal": "Legal",
  "helpCenter": "Help Center",
  "faq": "FAQ",
  "contactUs": "Contact Us",
  "privacyPolicy": "Privacy Policy",
  "termsOfService": "Terms of Service",
  "cookies": "Cookies",
  "copyright": "© 2026 Hoc Tu Thien. All rights reserved.",
  "tryAgain": "Try again",
  "loading": "Loading...",
  "profile": "Profile",
  "myCourses": "My Courses",
  "createdCourses": "Created Courses",
  "signOut": "Sign Out",

  // Auth
  "backToHome": "Back to Homepage",
  "heroTitle": "Explore new horizons of academic excellence.",
  "heroSubtitle": "Our space provides the tools and clarity needed to navigate complex intellectual landscapes.",
  "policy": "Policy",
  "reportIssue": "Report Bug",
  "welcomeBack": "Welcome Back!",
  "loginSubtitle": "Welcome back to Hoc Tu Thien. Please enter your credentials to log in.",
  "signInWithGoogle": "Sign in with Google",
  "orContinueWithEmail": "or continue with email",
  "emailAddress": "Email Address",
  "password": "Password",
  "forgotPassword": "Forgot Password?",
  "signIn": "Sign In",
  "signingIn": "Logging in...",
  "rememberMe": "Remember me",
  "noAccount": "Don't have an account?",
  "createAccount": "Create New Account",
  "showPassword": "Show password",
  "hidePassword": "Hide password",
  "createAccountTitle": "Unlock Your Potential",
  "createAccountSubtitle": "Create an account to access our exclusive academic resources.",
  "fullName": "Full Name",
  "confirmPassword": "Confirm Password",
  "signUpWithGoogle": "Google",
  "signInWithGitHub": "GitHub",
  "orQuickAuth": "OR QUICK SIGN UP WITH",
  "signingUp": "Creating account...",
  "alreadyHaveAccount": "Already have an account?",
  "agreeToTerms": "I agree to the",
  "loginLoadingText": "Loading login page...",
  "registerLoadingText": "Preparing registration page...",
  
  // Homepage
  "heroTitle1": "Learn to Share",
  "heroTitle2": "Teach to Create",
  "heroSubtitle": "Explore new horizons of academic excellence and mentorship with our community of experts.",
  "joinWithUs": "Join with us",
  "topMentors": "Top Mentors",
  "expertGuidance": "Expert guidance always",
  "benefitsTitle": "Benefits of learning",
  "benefitsHeading": "What are the benefits of online learning?",
  "benefitsDesc": "Experience the freedom of learning from anywhere with a comprehensive online platform designed for modern students.",
  "flexibleClasses": "Flexible Classes",
  "flexibleDesc": "Learn at your own pace and schedule.",
  "affordablePrice": "Affordable Price",
  "affordableDesc": "High-quality education accessible to everyone.",
  "mentorshipDesc": "Get guidance from industry experts.",
  "lifetimeAccess": "Lifetime Access",
  "lifetimeDesc": "Access your courses anytime, anywhere.",
  "premiumCourses": "Premium Courses",
  "premiumCoursesDesc": "Choose from a wide range of specialized courses designed to help you excel.",
  "allCategories": "All Categories",
  "instructorTitle": "Our Experts",
  "instructorHeading": "Professional Instructor Team",
  "joinWithMe": "Join with me",
  "viewAllInstructors": "View all instructors",
  "newsletterHeading": "Subscribe to receive daily updates on new courses",
  "newsletterDesc": "Get notified about new courses, special offers, and industry updates.",
  "becomeMentorTitle": "Become a Mentor",
  "becomeMentorHeading": "Share knowledge, build the future",
  "becomeMentorDesc": "Join our expert team to share experience and guide the next generation.",
  "becomeMentorButton": "Register as a Mentor now",
  "brandDescription": "Non-profit education platform connecting knowledge and spreading love through high-quality courses and mentorship.",
  "latestPosts": "Latest Posts & News",
  "latestPostsDesc": "Stay updated with meaningful knowledge, stories, and educational activities from our community.",
  "readMore": "Read article",
  "noPostsFound": "No posts found.",
  "uncategorized": "Uncategorized",
  
  // Policies Page
  "hocTuThien": "Hoc Tu Thien",
  "supportContact": "Support Contact",
  "email": "Email",
  "website": "Website",
  
  // Admin settings
  "policyConfig": "Policy Configuration",
  "policyDesc": "This policy is displayed at the footer, terms page, and during account registration.",
  "reload": "Reload",
  "savePolicy": "Save Policy",
  "generalInfo": "General Information",
  "agreeOnRegister": "Acknowledgement on registration",
  "internalNote": "Internal note",
  "policySection": "Policy Section",
  "delete": "Delete",
  "sectionTitle": "Section Title",
  "sectionContent": "Content - each line is an item",
  "addPolicySection": "Add Policy Section",
  "preview": "Preview"
};

function translateObj(obj) {
  if (typeof obj === 'string') {
    // If we have a direct mapping, use it
    if (commonTranslations[obj]) {
      return commonTranslations[obj];
    }
    // Try mapping without spaces or punctuation
    const trimmed = obj.trim();
    if (commonTranslations[trimmed]) {
      return commonTranslations[trimmed];
    }
    // Fallback: translate simple Vietnamese phrases or keep original
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => translateObj(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      // Look up key translation mapping
      if (commonTranslations[key]) {
        newObj[key] = commonTranslations[key];
      } else {
        newObj[key] = translateObj(obj[key]);
      }
    }
    return newObj;
  }

  return obj;
}

const enData = translateObj(viData);

// Save en.json file
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
console.log('Successfully generated en.json');
