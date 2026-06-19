# Wellness Support Network Audit: KARA V3

## 1. Pathway Verification

### Level 2: Trusted Human Support
*   **Pathway:** Sobat Mistis Bhumi (WhatsApp Community).
*   **Implementation:** `COMMUNITY_CONFIG.whatsappLink` triggers a WhatsApp redirect.
*   **Effectiveness:** **MEDIUM.** While accessible, a WhatsApp community is a "one-to-many" support structure. It does not guarantee the "Trusted Human Support" (one-to-one) that Level 2 implies.

### Level 3: Professional Support
*   **Pathway:** SEJIWA Screening & Indonesia Sehat Jiwa.
*   **Implementation:** External URL links.
*   **Effectiveness:** **HIGH.** These are established Indonesian mental health resources.

### Level 6: Jalur Aman (Emergency)
*   **Pathway:** Healing119 (Call & Web).
*   **Implementation:** Direct phone call trigger (`119`) and external URL.
*   **Effectiveness:** **CRITICAL/HIGH.** Direct integration with government mental health emergency lines.

## 2. Potential Barriers
1.  **Internet Dependency:** All support levels (except the 119 call) require an active internet connection.
2.  **App Exit:** All external support paths take the user *out* of the Bhumi app. There is no "Warm Handoff" or internal messaging system.
3.  **Community Saturation:** If the Sobat Mistis WhatsApp group is inactive or overwhelmed, the primary Level 2 path fails for the user.

## 3. Human Support Realism
The "Buddy" and "Circle" features observed in `WellnessAssessmentFlow.tsx` are currently **disabled (Lock icon)** in the UI. This means the system currently relies almost entirely on the WhatsApp group for non-professional human connection.
