export default function SampleTrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="he" dir="rtl">
      {children}
    </div>
  );
}
