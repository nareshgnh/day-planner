// src/utils/offlineSync.js
import { db } from "../firebaseConfig";
import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

class OfflineSync {
  constructor() {
    this.pendingChanges = this.loadPendingChanges();
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  loadPendingChanges() {
    try {
      const saved = localStorage.getItem("pendingHabitChanges");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  savePendingChanges() {
    localStorage.setItem(
      "pendingHabitChanges",
      JSON.stringify(this.pendingChanges)
    );
  }

  addPendingChange(change) {
    this.pendingChanges.push({
      ...change,
      timestamp: Date.now(),
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
    this.savePendingChanges();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingChanges();
    }
  }

  async syncPendingChanges() {
    if (!this.isOnline || this.pendingChanges.length === 0) return;

    const changesToSync = [...this.pendingChanges];
    this.pendingChanges = [];
    this.savePendingChanges();

    for (const change of changesToSync) {
      try {
        await this.applyChange(change);
      } catch (error) {
        console.error("Failed to sync change:", change, error);
        // Re-add failed change to pending list
        this.pendingChanges.push(change);
      }
    }

    if (this.pendingChanges.length > 0) {
      this.savePendingChanges();
    }
  }

  async applyChange(change) {
    switch (change.type) {
      case "UPDATE_HABIT":
        await setDoc(doc(db, "habits", change.data.id), change.data, {
          merge: true,
        });
        break;
      case "DELETE_HABIT":
        await deleteDoc(doc(db, "habits", change.data.id));
        break;
      case "UPDATE_HABIT_LOG":
        const logDocRef = doc(db, "habitLog", change.data.date);
        if (change.data.value === null) {
          await updateDoc(logDocRef, { [change.data.habitId]: deleteField() });
        } else {
          await setDoc(
            logDocRef,
            { [change.data.habitId]: change.data.value },
            { merge: true }
          );
        }
        break;
    }
  }

  // Wrapper methods for your existing functions
  async updateHabitOffline(habitData) {
    this.addPendingChange({
      type: "UPDATE_HABIT",
      data: habitData,
    });
  }

  async deleteHabitOffline(habitId) {
    this.addPendingChange({
      type: "DELETE_HABIT",
      data: { id: habitId },
    });
  }

  async updateHabitLogOffline(habitId, date, value) {
    this.addPendingChange({
      type: "UPDATE_HABIT_LOG",
      data: { habitId, date: date.toISOString().split("T")[0], value },
    });
  }

  getPendingChangesCount() {
    return this.pendingChanges.length;
  }
}

export const offlineSync = new OfflineSync();
