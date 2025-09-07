import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Civic Sense Reporting</Text>

      {/* Report Offence */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Report Offence")}
      >
        <Text style={styles.buttonText}>📢 Report Offence</Text>
      </TouchableOpacity>

      {/* Previous Reports */}
      <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("Previous Reports")}
>
  <Text style={styles.buttonText}>Previous Reports</Text>
</TouchableOpacity>

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default HomeScreen;
