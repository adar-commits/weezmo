import { Font } from "@react-pdf/renderer";

/**
 * Embeds a Hebrew-capable font in PDFs. Built-in Helvetica cannot shape Hebrew
 * and produces mojibake unless a Unicode font is registered.
 * @see https://fonts.google.com/noto/specimen/Noto+Sans+Hebrew
 */
const NOTO_SANS_HEBREW = "NotoSansHebrew";

Font.register({
  family: NOTO_SANS_HEBREW,
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/notosanshebrew/v50/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXd4qtog.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/notosanshebrew/v50/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXRYqtog.ttf",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/notosanshebrew/v50/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXkI2tog.ttf",
      fontWeight: 700,
    },
  ],
});

export const PDF_HEBREW_FONT_FAMILY = NOTO_SANS_HEBREW;
