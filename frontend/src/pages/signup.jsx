import { useState } from "react";
import { auth, db } from "../config/firebase.jsx";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    userType: "buyer", // Default role select options
    idNumber: "",
    agencyName: "",
    ppraNumber: "",
  });

  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    try {
      // 1. Authenticate user credentials in the cloud secure layer
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;

      // 2. Map structural profile fields for Firestore
      const userProfile = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        userType: formData.userType,
        createdAt: serverTimestamp(),
        identityVerification: {
          idNumber: formData.idNumber,
          isDhaVerified: false, // ❌ Safety lock defaults to false
          verifiedAt: null
        }
      };

      // 3. Write data directly into the 'users' collection using UID as the Document ID
      await setDoc(doc(db, "users", uid), userProfile);

      // 4. Handle secondary profile data mapping if they are a property agent
      if (formData.userType === "agent") {
        const agentMetadata = {
          agencyName: formData.agencyName || "Independent Broker",
          ppraNumber: formData.ppraNumber,
          isAgentVerified: false, // ❌ Safety lock defaults to false
          ffcExpiryDate: null,
          totalActiveListings: 0
        };
        await setDoc(doc(db, "agents", uid), agentMetadata);
      }

      setStatus({ loading: false, error: null, success: true });
      
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, error: err.message, success: false });
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "50px auto", padding: "30px", fontFamily: "sans-serif", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
      <h2 style={{ color: "#1d4ed8", textAlign: "center", marginBottom: "5px" }}>🏡 eKhaya Link</h2>
      <p style={{ textAlign: "center", color: "#64748b", fontSize: "14px", marginTop: "0", marginBottom: "25px" }}>Data Validation & Intake Portal</p>

      {status.error && <div style={{ backgroundColor: "#fef2f2", color: "#b91c1c", padding: "10px", borderRadius: "6px", fontSize: "14px", marginBottom: "15px", border: "1px solid #fee2e2" }}>⚠️ {status.error}</div>}
      {status.success && <div style={{ backgroundColor: "#f0fdf4", color: "#15803d", padding: "10px", borderRadius: "6px", fontSize: "14px", marginBottom: "15px", border: "1px solid #dcfce7" }}>🟢 Success! Look at your live Firebase Dashboard context!</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
        <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
        <input type="text" name="idNumber" placeholder="South African ID Number" maxLength="13" onChange={handleChange} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
        <input type="tel" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
        <input type="password" name="password" placeholder="Password (Min 6 characters)" onChange={handleChange} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
        
        <select name="userType" onChange={handleChange} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "white" }}>
          <option value="buyer">Register as standard Property Buyer</option>
          <option value="agent">Register as professional Estate Agent</option>
        </select>

        {formData.userType === "agent" && (
          <div style={{ backgroundColor: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px dashed #cbd5e1", display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" name="agencyName" placeholder="Agency / Firm Name" onChange={handleChange} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "white" }} />
            <input type="text" name="ppraNumber" placeholder="7-Digit PPRA Practitioner Number" maxLength="7" onChange={handleChange} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "white" }} />
          </div>
        )}

        <button type="submit" disabled={status.loading} style={{ padding: "12px", borderRadius: "6px", border: "none", backgroundColor: "#1d4ed8", color: "white", fontWeight: "bold", cursor: "pointer", opacity: status.loading ? 0.5 : 1 }}>
          {status.loading ? "Streaming to Cloud Matrix..." : "Register & Write to Firebase"}
        </button>
      </form>
    </div>
  );
}
