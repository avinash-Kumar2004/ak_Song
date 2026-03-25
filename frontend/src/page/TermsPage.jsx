import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SECTIONS = {
  terms: [
    {
      title: "1. Acceptance of Terms",
      body: `By accessing or using SoundWave ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.

We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the Service after any changes constitutes your acceptance of the new Terms. We encourage you to review these Terms periodically.`,
    },
    {
      title: "2. Description of Service",
      body: `SoundWave provides a music streaming platform that allows users to discover, stream, and manage audio content. The Service includes access to a library of songs, playlists, artist profiles, and personalized recommendations. Some features of the Service require account registration and may be subject to additional terms.

We continuously work to improve our Service and may add, modify, or remove features at any time. We will endeavor to notify users of significant changes through the app or via email.`,
    },
    {
      title: "3. User Accounts",
      body: `To access certain features, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for maintaining the confidentiality of your account credentials.

You are solely responsible for all activities that occur under your account. You must immediately notify SoundWave of any unauthorized use of your account or any other breach of security. SoundWave will not be liable for any loss resulting from unauthorized use of your account.`,
    },
    {
      title: "4. Content and Licenses",
      body: `All music, audio content, artwork, and related materials available through the Service are protected by copyright and other intellectual property laws. SoundWave grants you a limited, non-exclusive, non-transferable license to access and use the content solely for personal, non-commercial purposes.

You may not copy, reproduce, distribute, transmit, broadcast, display, sell, license, or otherwise exploit any content for any other purpose without the prior written consent of SoundWave or the respective rights holders.`,
    },
    {
      title: "5. Prohibited Conduct",
      body: `You agree not to engage in any of the following: (a) using the Service for any unlawful purpose; (b) attempting to gain unauthorized access to any part of the Service; (c) interfering with or disrupting the integrity or performance of the Service; (d) collecting or harvesting any personally identifiable information from the Service; (e) using automated tools, bots, or scrapers to access the Service.

Violations of these prohibitions may result in immediate termination of your account and may expose you to civil or criminal liability.`,
    },
    {
      title: "6. Subscription and Payments",
      body: `SoundWave offers both free and premium subscription plans. Premium subscriptions are billed on a recurring basis (monthly or annually) as selected at the time of purchase. All payments are processed securely through third-party payment processors.

You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period. We do not provide refunds for partial billing periods, except where required by applicable law.`,
    },
    {
      title: "7. Termination",
      body: `SoundWave reserves the right to suspend or terminate your account at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, the Service, or third parties, or for any other reason at our sole discretion.

Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.`,
    },
    {
      title: "8. Disclaimer of Warranties",
      body: `The Service is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.

SoundWave does not warrant that the Service will be uninterrupted, error-free, or completely secure. You acknowledge that there are risks inherent in internet connectivity that could result in the loss of your privacy, data, or property.`,
    },
    {
      title: "9. Governing Law",
      body: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which SoundWave operates, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in that jurisdiction.`,
    },
  ],
  privacy: [
    {
      title: "1. Information We Collect",
      body: `We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support. This includes your name, email address, password, and profile picture.

We also automatically collect certain information when you use the Service, including your IP address, browser type, operating system, referring URLs, device identifiers, and cookie data. We collect information about your interactions with the Service, such as the songs you listen to, playlists you create, and features you use.`,
    },
    {
      title: "2. How We Use Your Information",
      body: `We use the information we collect to provide, maintain, and improve our Service; to process transactions and send related information; to send promotional communications (with your consent); to monitor and analyze trends and usage; to detect and prevent fraudulent or illegal activity; and to personalize your experience through music recommendations.

We may also use your information to comply with legal obligations and to enforce our Terms of Service.`,
    },
    {
      title: "3. Information Sharing",
      body: `We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating the Service, conducting our business, or serving our users — provided those parties agree to keep this information confidential.

We may also disclose your information if required by law, or in the good-faith belief that such disclosure is necessary to comply with legal process, respond to claims, or protect the rights, property, or safety of SoundWave, our users, or the public.`,
    },
    {
      title: "4. Data Retention",
      body: `We retain your personal information for as long as your account is active or as needed to provide you with the Service. You may request deletion of your personal data at any time by contacting us. We will honor such requests within 30 days, subject to our legal obligations to retain certain data.

Aggregated and anonymized data may be retained indefinitely for analytical purposes, as this data cannot be used to identify you personally.`,
    },
    {
      title: "5. Cookies and Tracking",
      body: `We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with a small amount of data that are stored on your device. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.

We also use analytics services that may place cookies on your browser and collect information about your use of the Service.`,
    },
    {
      title: "6. Security",
      body: `We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. We use industry-standard encryption (SSL/TLS) for data transmission and store passwords using secure hashing algorithms.

However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security and encourage you to use strong, unique passwords and to keep your account credentials confidential.`,
    },
    {
      title: "7. Children's Privacy",
      body: `Our Service is not intended for children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us so that we can take necessary action.`,
    },
    {
      title: "8. Your Rights",
      body: `Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data; the right to object to or restrict processing; and the right to data portability.

To exercise any of these rights, please contact us at privacy@soundwave.app. We will respond to your request within a reasonable timeframe and in accordance with applicable law.`,
    },
    {
      title: "9. Contact Us",
      body: `If you have any questions about this Privacy Policy or our data practices, please contact us at:\n\nSoundWave Inc.\nprivacy@soundwave.app\n+1 (800) 123-4567\n\nWe are committed to resolving any complaints about your privacy and our collection or use of your personal information.`,
    },
  ],
};

export default function TermsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => {
    const hash = window.location.hash;
    return hash === "#privacy" ? "privacy" : "terms";
  });

  const sections = SECTIONS[tab];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0c12",
      paddingTop: 80,
      paddingBottom: 80,
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Hero */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: 32,
        marginBottom: 0,
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.4)", fontSize: 13,
              marginBottom: 20, padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back
          </button>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{
                fontSize: 32, fontWeight: 800, color: "#fff",
                margin: 0, letterSpacing: "-0.5px",
              }}>
                Legal &amp; Privacy
              </h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 6, margin: "6px 0 0" }}>
                Last updated: March 2025 · Effective immediately
              </p>
            </div>
            {/* Tab switcher */}
            <div style={{
              display: "flex", background: "rgba(255,255,255,0.06)",
              borderRadius: 12, padding: 4, gap: 4, alignSelf: "flex-start",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              {[
                { id: "terms",   label: "Terms of Service" },
                { id: "privacy", label: "Privacy Policy" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    padding: "8px 18px", borderRadius: 9,
                    border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: tab === id ? "#6c63ff" : "transparent",
                    color: tab === id ? "#fff" : "rgba(255,255,255,0.45)",
                    transition: "all 0.2s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary banner */}
      <div style={{
        background: "rgba(108,99,255,0.08)",
        borderBottom: "1px solid rgba(108,99,255,0.15)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "14px 20px" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>
            {tab === "terms"
              ? "📋 These terms govern your use of SoundWave. Please read carefully — they include important info about your rights and obligations."
              : "🔒 Your privacy matters to us. This policy explains what data we collect, how we use it, and your rights over it."}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 0" }}>
        {sections.map((sec, i) => (
          <div
            key={i}
            style={{
              marginBottom: 36,
              paddingBottom: 36,
              borderBottom: i < sections.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            <h2 style={{
              fontSize: 17, fontWeight: 700,
              color: "#fff", margin: "0 0 12px",
              letterSpacing: "-0.2px",
            }}>
              {sec.title}
            </h2>
            {sec.body.split("\n\n").map((para, j) => (
              <p key={j} style={{
                fontSize: 14.5, color: "rgba(255,255,255,0.55)",
                lineHeight: 1.8, margin: "0 0 12px",
              }}>
                {para}
              </p>
            ))}
          </div>
        ))}

        {/* Footer */}
        <div style={{
          marginTop: 40, padding: "24px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)",
          textAlign: "center",
        }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "0 0 12px" }}>
            Questions about our {tab === "terms" ? "terms" : "privacy policy"}?
          </p>
          <a
            href="mailto:legal@soundwave.app"
            style={{
              display: "inline-block",
              padding: "10px 24px", borderRadius: 100,
              background: "rgba(108,99,255,0.15)",
              border: "1px solid rgba(108,99,255,0.3)",
              color: "#6c63ff", fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Contact legal@soundwave.app
          </a>
        </div>
      </div>
    </div>
  );
}