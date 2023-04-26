import React, { useState, useEffect } from "react";
import { ref, onValue, off, set } from "firebase/database";
import db from "./firebaseConfig";

const MyComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const databaseRef = ref(db, "/test/");
    onValue(databaseRef, (snapshot) => {
      setData(snapshot.val());
    });

    // Cleanup the listener when the component is unmounted
    return () => {
      off(databaseRef);
    };
  }, []);

  const setDataInDatabase = async () => {
    const databaseRef = ref(db, "/test/");
    const data = {
      key1: "value1",
      key2: "value2",
    };
    try {
      await set(databaseRef, data);
      console.log("Data saved successfully.");
    } catch (error) {
      console.error("Error saving data: ", error);
    }
  };

  return (
    <div>
      <h1>Data from Firebase Realtime Database:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default MyComponent;
