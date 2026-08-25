export type SymbolItem = {
  name: string;
  description: string;
  count: string;
  kind: "major" | "wands" | "cups" | "swords" | "pentacles";
};

export const symbols: SymbolItem[] = [
  {
    name: "Ẩn chính",
    description: "Những cột mốc lớn của linh hồn, nơi bài học hiện lên như nghi lễ.",
    count: "22 lá",
    kind: "major",
  },
  {
    name: "Gậy",
    description: "Ý chí, lửa sáng tạo và hành động đang tìm hình hài.",
    count: "14 lá",
    kind: "wands",
  },
  {
    name: "Cốc",
    description: "Cảm xúc, trực giác và dòng nước mềm của ký ức.",
    count: "14 lá",
    kind: "cups",
  },
  {
    name: "Kiếm",
    description: "Tư duy, lựa chọn và lưỡi sáng của sự thật.",
    count: "14 lá",
    kind: "swords",
  },
  {
    name: "Đĩa",
    description: "Thân thể, vật chất và những điều cần được neo xuống đất.",
    count: "14 lá",
    kind: "pentacles",
  },
];
