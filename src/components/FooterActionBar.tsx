import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryIcon?: keyof typeof Ionicons.glyphMap;
  secondaryIcon?: keyof typeof Ionicons.glyphMap;
  disabledPrimary?: boolean;
  showSecondary?: boolean;
};

export function FooterActionBar({
  onPrimaryPress,
  onSecondaryPress,
  primaryLabel = "Salvar",
  secondaryLabel = "Cancelar",
  primaryIcon = "save-outline",
  secondaryIcon = "close-outline",
  disabledPrimary = false,
  showSecondary = true,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {showSecondary && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onSecondaryPress}
            accessibilityLabel={secondaryLabel}
          >
            <Ionicons name={secondaryIcon} size={18} color="#0F172A" />
            <Text style={styles.secondaryText}>{secondaryLabel}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.primaryBtn, disabledPrimary && styles.primaryBtnDisabled]}
          onPress={onPrimaryPress}
          disabled={disabledPrimary}
          accessibilityLabel={primaryLabel}
        >
          <Ionicons name={primaryIcon} size={18} color="#fff" />
          <Text style={styles.primaryText}>{primaryLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    paddingBottom: Platform.select({ ios: 16, android: 12 }),
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 12,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "space-between",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 14,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0A66C2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    backgroundColor: "#93C5FD",
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});