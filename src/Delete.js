import React from "react";
import { ref, remove } from "firebase/database";
import db from "./firebaseConfig";

const DeleteAll = () => {
  const Delete = () => {
    const databaseRef = ref(db, "/");

    remove(databaseRef)
      .then(() => {
        console.log("All data removed successfully");
      })
      .catch((error) => {
        console.error("Error removing data:", error);
      });
  };

  return (
    <div>
      <button onClick={() => Delete()}>DELETE ALL</button>
    </div>
  );
};

export default DeleteAll;
