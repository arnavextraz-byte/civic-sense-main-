import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./services/firebase";

export default function PreviousReportsScreen() {
  const [inProgressReports, setInProgressReports] = useState([]);
  const [doneReports, setDoneReports] = useState([]);
  const [activeTab, setActiveTab] = useState("inProgress");

  const renderItem = ({ item }) => (
    <View style={styles.reportItem}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{item.type}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "resolved" ? styles.resolvedBadge : styles.inProgressBadge
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "resolved" ? styles.resolvedText : styles.inProgressText
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.reportLocation}>📍 {item.address || "(no address)"}</Text>
      <Text style={styles.reportDate}>📅 {new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  const dataToShow = activeTab === "inProgress" ? inProgressReports : doneReports;

  const loadReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reports"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInProgressReports(data.filter(r => r.status !== "resolved"));
      setDoneReports(data.filter(r => r.status === "resolved"));
    } catch (e) {
      console.error("Failed to load reports", e);
    }
  };

  useEffect(() => {
    loadReports();

    // If you still need live updates via SSE:
    // const es = new EventSource("http://localhost:4000/events");
    // es.onmessage = () => loadReports();
    // return () => es.close();
  }, []);

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Previous Reports</Text>
      
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === "inProgress" && styles.activeTabButton
          ]}
          onPress={() => switchTab("inProgress")}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === "inProgress" && styles.activeTabButtonText
          ]}>
            In Progress ({inProgressReports.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === "done" && styles.activeTabButton
          ]}
          onPress={() => switchTab("done")}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === "done" && styles.activeTabButtonText
          ]}>
            Past Reports ({doneReports.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {dataToShow.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {activeTab === "inProgress" ? "No reports in progress" : "No past reports"}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === "inProgress" 
                ? "Your submitted reports will appear here" 
                : "Completed reports will be shown here"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={dataToShow}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    color: "#2c3e50",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#e9ecef",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabButton: {
    backgroundColor: "#007bff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
  },
  activeTabButtonText: {
    color: "#fff",
  },
  contentContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  tabContent: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  reportItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inProgressBadge: {
    backgroundColor: "#fff3cd",
  },
  resolvedBadge: {
    backgroundColor: "#d4edda",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  inProgressText: {
    color: "#856404",
  },
  resolvedText: {
    color: "#155724",
  },
  reportLocation: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: "#6c757d",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#adb5bd",
    textAlign: "center",
    lineHeight: 20,
  },
});

