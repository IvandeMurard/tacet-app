import { Text, View } from "react-native";

interface TierBadgeProps {
  label: string;
  color: string;
}

export function TierBadge({ label, color }: TierBadgeProps) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        backgroundColor: `${color}18`,
        borderColor: `${color}33`,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          color,
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
