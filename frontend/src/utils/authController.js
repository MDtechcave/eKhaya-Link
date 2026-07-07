import {auth, db} from "../config/firebase";
import{CreateUserWithEmailAndPassword} from "firebase/auth";
import {doc, setDoc, timestamp} from "firebase/firestore";

export async function handleSignUp(formData) {
try {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
    );
    

        
const uid = userCredential.user.uid;

const userProfile = {
    uid: uid,
    firstname: formData.firstname,
    lastname: formData.lastname,
    email: formData.email,
    phonenumber:formData.phonenumber,
    usertype: formData.usertype,
    createdAt: serverTimestamp(),
    
    identityVerification: {
        idnumber: formData.idnumber,
        isDhaVerified: false,
        VerifiedAt: null,
    }   
};

await setDoc(doc(db, "users", uid), userProfile);

if (formData.userType === "agent") {
      const agentMetadata = {
        agencyName: formData.agencyName || "Independent Broker",
        ppraNumber: formData.ppraNumber, 
        isAgentVerified: false,          
        ffcExpiryDate: null,
        totalActiveListings: 0
      };
    

      await setDoc(doc(db, "agents", uid), agentMetadata);
    }

      return {success: true, uid};


    } catch(error) {
        console.error("Critical error inside eKhaya Link registration pipeline")
        return {success: false, error: error.message}
      }
    }
