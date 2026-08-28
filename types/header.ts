export type HeaderViewer =
  | { kind: "guest" }
  | { kind: "customer"; name: string }
  | { kind: "staff"; name: string; role: "admin" | "staff" };
