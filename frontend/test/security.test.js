const { 
  initializeTestEnvironment, 
  assertFails, 
  assertSucceeds 
} = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc } = require('firebase/firestore');
const fs = require('fs');

let testEnv;

beforeAll(async () => {
  // 1. Read your active security rules from your local frontend folder root
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  
  // 2. Initialize the isolated local testing matrix sandbox
  testEnv = await initializeTestEnvironment({
    projectId: 'ekhaya-link-test-project',
    firestore: { rules }
  });
});

afterAll(async () => {
  // Clean up and terminate the test runner environment channels
  await testEnv.cleanup();
});

beforeEach(async () => {
  // Clear the database tracking state before each script runs
  await testEnv.clearFirestore();
});

describe(" eKhaya Link Marketplace Security Rules Matrix", () => {

  it("❌ SHOULD DENY access to property listings that are pending vetting paperwork", async () => {
    // Setup: Inject a mock pending property listing into the local emulator admin context
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "properties/unverified_house_101"), {
        title: "Fake Listing in Site C",
        price: 450000,
        verificationStatus: "pending" // <-- Stuck in vetting!
      });
    });

    // Execution: Simulate a completely random, unauthenticated website user trying to view it
    const buyerContext = testEnv.unauthenticatedContext();
    const buyerDb = buyerContext.firestore();
    const targetDoc = doc(buyerDb, "properties/unverified_house_101");

    // Assertion: Assert that Firebase rules successfully block the read request!
    await assertFails(getDoc(targetDoc));
  });

  it(" SHOULD ALLOW anyone to read properties that have passed admin checks", async () => {
    // Setup: Inject a verified property listing
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "properties/safe_house_202"), {
        title: "Verified 3-Bed in Ilitha Park",
        price: 680000,
        verificationStatus: "verified" // <-- Marked safe by an admin!
      });
    });

    const buyerContext = testEnv.unauthenticatedContext();
    const buyerDb = buyerContext.firestore();
    const targetDoc = doc(buyerDb, "properties/safe_house_202");

    // Assertion: Assert that the security rules allow this clean data to be fetched safely
    await assertSucceeds(getDoc(targetDoc));
  });

});

describe(" eKhaya Link User Registration Security Matrix", () => {

  it(" SHOULD initialize new accounts with strict FALSE verification flags", async () => {
    const agentUid = "test_agent_99";
    const agentContext = testEnv.authenticatedContext(agentUid);
    const db = agentContext.firestore();

    // Define a malicious payload attempting to hack the switch to 'true' upfront
    const maliciousSignupData = {
      firstName: "Sibusiso",
      lastName: "Ndlovu",
      email: "sibu@kasirealty.co.za",
      userType: "agent",
      identityVerification: {
        idNumber: "9201015123081",
        isDhaVerified: true, // 🛑 Attempting to cheat the system!
        verifiedAt: new Date()
      }
    };

    const targetDoc = doc(db, "users", agentUid);

    // Assertion: Your database rules must REJECT this write because they tried to flag true!
    await assertFails(setDoc(targetDoc, maliciousSignupData));
  });

  it(" SHOULD ALLOW normal sign-up data where verification switches are false", async () => {
    const agentUid = "test_agent_100";
    const agentContext = testEnv.authenticatedContext(agentUid);
    const db = agentContext.firestore();

    // Clean, legitimate registration profile mapping matching our controller logic
    const legalSignupData = {
      firstName: "Thandiwe",
      lastName: "Mandela",
      email: "thandi@broker.co.za",
      userType: "agent",
      identityVerification: {
        idNumber: "9505055123082",
        isDhaVerified: false, // 🟢 Correct initial state
        verifiedAt: null
      }
    };

    const targetDoc = doc(db, "users", agentUid);

    // Assertion: This write should succeed cleanly into Firestore
    await assertSucceeds(setDoc(targetDoc, legalSignupData));
  });

});
