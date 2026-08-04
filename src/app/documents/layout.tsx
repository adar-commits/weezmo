/** Typography for /documents/* comes from document-page.css (--doc-font, Open Sans Hebrew). */
export default function DocumentsLayout({
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
