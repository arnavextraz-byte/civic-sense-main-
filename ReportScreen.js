import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, uploadToFirebase } from "./services/firebase";



const ReportScreen = () => {
  const [customIssue, setCustomIssue] = useState("");
  const [comments, setComments] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState("");

  // Location states
  const [location, setLocation] = useState(null);
  const [capturedLocation, setCapturedLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [capturedAddress, setCapturedAddress] = useState("");

  const issues = [
    "Garbage", "Pothole", "Traffic", "Noise", "Littering", 
    "Public Urination", "Spitting", "Noise Pollution", 
    "Illegal Parking", "Graffiti", "Broken Street Lights", "Blocked Sidewalks"
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (address.length > 0) {
        const addr = address[0];
        return `${addr.street || ""} ${addr.streetNumber || ""}, ${addr.city || ""}, ${addr.region || ""}, ${addr.country || ""}`.trim();
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error("Error getting address:", error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Permission to access location is required!");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      const address = await getAddressFromCoordinates(loc.coords.latitude, loc.coords.longitude);
      setCurrentAddress(address);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get location");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(false);
    setDate(currentDate);
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Permission to access camera is required!");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setPhotos([...photos, result.assets[0].uri]);
        let loc = await Location.getCurrentPositionAsync({});
        setCapturedLocation(loc.coords);
        const address = await getAddressFromCoordinates(loc.coords.latitude, loc.coords.longitude);
        setCapturedAddress(address);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error selecting from gallery:", error);
      Alert.alert("Error", "Failed to select from gallery");
    }
  };

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
    setCustomIssue("");
  };

  const [submitting, setSubmitting] = useState(false);

  const submitReport = async () => {
    if (!location) {
      Alert.alert("Error", "Please ensure location is available");
      return;
    }
    if (!selectedIssue && !customIssue) {
      Alert.alert("Error", "Please select or describe a problem");
      return;
    }
    try {
      setSubmitting(true);

      let mediaUrl = null;
      if (photos.length > 0) {
        try {
          mediaUrl = await uploadToFirebase(photos[0]);
        } catch (e) {
          console.warn("Image upload failed:", e);
        }
      }

      await addDoc(collection(db, "reports"), {
        type: selectedIssue || customIssue,
        description: comments,
        latitude: location.latitude,
        longitude: location.longitude,
        address: currentAddress,
        createdAt: serverTimestamp(),
        status: "inProgress",
        mediaUrl: mediaUrl || null,
      });

      Alert.alert("Report Submitted", "Your report has been submitted successfully.");
      setSelectedIssue("");
      setCustomIssue("");
      setComments("");
      setPhotos([]);
      setCapturedLocation(null);
    } catch (e) {
      console.error("Error submitting report:", e);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Civic Sense Reporting</Text>

          {/* Map */}
          <Text style={styles.label}>📍 Current Location</Text>
          {region ? (
            <View style={styles.mapContainer}>
              <MapView style={styles.map} initialRegion={region} showsUserLocation={true}>
                {location && (
                  <Marker coordinate={location} title="You are here" description={currentAddress} />
                )}
              </MapView>
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>📍 Address:</Text>
                <Text style={styles.addressText}>{currentAddress || "Getting address..."}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.locationPlaceholder}>
              <Text style={styles.placeholderText}>Fetching location...</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={getCurrentLocation}>
                <Text style={styles.refreshButtonText}>Refresh Location</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Camera & Gallery */}
          <Text style={styles.label}>📷 Media Evidence</Text>
          <View style={styles.mediaButtons}>
            <TouchableOpacity style={styles.mediaButton} onPress={openCamera}>
              <Text style={styles.mediaButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton} onPress={selectFromGallery}>
              <Text style={styles.mediaButtonText}>From Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Issues */}
          <Text style={styles.label}>⚠️ Select Problem:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {issues.map((issue, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.issueBtn,
                  selectedIssue === issue && styles.selectedIssueBtn,
                ]}
                onPress={() => handleIssueSelect(issue)}
              >
                <Text
                  style={[
                    styles.issueText,
                    selectedIssue === issue && styles.selectedIssueText,
                  ]}
                >
                  {issue}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Custom Issue */}
          <Text style={styles.label}>✏️ Or describe custom problem:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter custom issue..."
            value={customIssue}
            onChangeText={setCustomIssue}
            multiline
          />

          {/* Comments */}
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Additional comments"
            value={comments}
            onChangeText={setComments}
            multiline
          />

          {/* Submit */}
          <TouchableOpacity style={styles.submitButton} onPress={submitReport} disabled={submitting}>
            <Text style={styles.submitButtonText}>
              {submitting ? "Submitting..." : "Submit Report"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { flexGrow: 1, padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2c3e50",
  },
  mapContainer: { marginBottom: 16, borderRadius: 8, overflow: "hidden" },
  map: { width: "100%", height: 220 },
  addressContainer: { backgroundColor: "#f8f9fa", padding: 12 },
  addressLabel: { fontSize: 12, fontWeight: "600", color: "#6c757d" },
  addressText: { fontSize: 14, color: "#495057" },
  locationPlaceholder: {
    height: 100,
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placeholderText: { color: "#6c757d", fontSize: 14, marginBottom: 8 },
  refreshButton: { backgroundColor: "#007bff", padding: 8, borderRadius: 6 },
  refreshButtonText: { color: "#fff" },
  mediaButtons: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  mediaButton: {
    backgroundColor: "#e74c3c",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  mediaButtonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  issueBtn: { backgroundColor: "#e9ecef", padding: 10, borderRadius: 20, marginRight: 8 },
  selectedIssueBtn: { backgroundColor: "#007bff" },
  issueText: { fontSize: 12, color: "#495057" },
  selectedIssueText: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center" },
});

export default ReportScreen;
