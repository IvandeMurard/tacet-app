import { View } from "react-native";

interface SerenityBarProps {
  score: number;
  color: string;
}

export function SerenityBar({ score, color }: SerenityBarProps) {
  return (
    <View className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <View
        style={{
          height: "100%",
          width: `${score}%`,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}
