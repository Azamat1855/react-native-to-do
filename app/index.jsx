import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const App = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const saveTasksToStorage = async (tasks) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const loadTasksFromStorage = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const addTask = () => {
    if (task.trim()) {
      const newTask = { id: Date.now(), name: task };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveTasksToStorage(updatedTasks);
      setTask("");
    }
  };

  const updateTask = () => {
    const updatedTasks = tasks.map((item) =>
      item.id === editingTaskId ? { ...item, name: task } : item
    );
    setTasks(updatedTasks);
    saveTasksToStorage(updatedTasks);
    setTask("");
    setEditingTaskId(null);
  };

  const removeTask = (id) => {
    const updatedTasks = tasks.filter((item) => item.id !== id);
    setTasks(updatedTasks);
    saveTasksToStorage(updatedTasks);
  };

  const clearAllTasks = () => {
    setTasks([]);
    saveTasksToStorage([]);
  };

  const handleDragEnd = ({ data }) => {
    setTasks(data);
    saveTasksToStorage(data);
  };

  const getTaskBackgroundColor = (index) => {
    switch (index) {
      case 0:
        return "#FFD700"; // Gold
      case 1:
        return "#C0C0C0"; // Silver
      case 2:
        return "#CD7F32"; // Bronze
      default:
        return "#4B5563"; // Default (gray)
    }
  };

  useEffect(() => {
    loadTasksFromStorage();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-2xl font-bold text-white mb-6">To-Do List</Text>

        <TextInput
          className="w-full border-2 border-white text-white p-3 rounded-lg mb-4"
          placeholder="Enter a task"
          placeholderTextColor="#aaa"
          value={task}
          onChangeText={setTask}
        />

        <TouchableOpacity
          className="bg-blue-600 w-full p-3 rounded-lg mb-10"
          onPress={editingTaskId ? updateTask : addTask}
        >
          <Text className="text-white text-center font-semibold">
            {editingTaskId ? "Save Task" : "Add Task"}
          </Text>
        </TouchableOpacity>

        <GestureHandlerRootView>
          <DraggableFlatList
            className="flex w-full"
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            onDragEnd={handleDragEnd}
            renderItem={({ item, drag, isActive, index }) => (
              <TouchableOpacity
                onLongPress={drag}
                disabled={isActive}
                style={{
                  backgroundColor: getTaskBackgroundColor(index),
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                className="flex-row justify-between items-center w-full gap-7 max-w-full flex-wrap"
              >
                <Text className="text-white flex-wrap">{item.name}</Text>
                <View className="flex flex-row gap-[2%] w-full justify-between">
                  <TouchableOpacity
                    onPress={() => removeTask(item.id)}
                    className="w-[48%]"
                  >
                    <Text className="text-white font-semibold text-center bg-red-500 p-3 rounded-lg">
                      Remove
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingTaskId(item.id);
                      setTask(item.name);
                    }}
                    className="w-[48%]"
                  >
                    <Text className="text-white font-semibold text-center bg-blue-500 p-3 rounded-lg">
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text className="text-gray-400 mt-6 text-center">
                No tasks added yet!
              </Text>
            }
          />
        </GestureHandlerRootView>

        {tasks.length > 0 && (
          <TouchableOpacity
            className="bg-red-600 w-full py-4 p-3 rounded-lg my-6"
            onPress={clearAllTasks}
          >
            <Text className="text-white text-center font-semibold">
              Delete All Tasks
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default App;
