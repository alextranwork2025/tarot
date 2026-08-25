import type { LucideIcon } from "lucide-react";
import { CircleDot, Hourglass, MoonStar } from "lucide-react";

export type Reading = {
  title: string;
  spread: string;
  description: string;
  icon: LucideIcon;
};

export const readings: Reading[] = [
  {
    title: "Thông điệp hôm nay",
    spread: "Rút 1 lá",
    description: "Dành cho suy ngẫm nhanh trước một câu hỏi đang khẽ vang lên.",
    icon: CircleDot,
  },
  {
    title: "Dòng chảy thời gian",
    spread: "Trải 3 lá",
    description: "Quá khứ, hiện tại và khả năng đang mở ra trong nhịp chuyển động.",
    icon: Hourglass,
  },
  {
    title: "Hành trình bóng tối",
    spread: "Trải bài chuyên sâu",
    description:
      "Khám phá nỗi sợ, khuôn mẫu và tiềm năng chuyển hóa phía sau chúng.",
    icon: MoonStar,
  },
];
