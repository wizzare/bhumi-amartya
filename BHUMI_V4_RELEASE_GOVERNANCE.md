# BHUMI V4 RELEASE GOVERNANCE

**Authority:** [BHUMI_V4_SOURCE_OF_TRUTH.md](BHUMI_V4_SOURCE_OF_TRUTH.md)

---

## 1. BUILD LIFECYCLE
*   **Development:** Feature branches and CI/CD automated builds.
*   **Testing:** Manual and automated QA in isolated environments.
*   **Audit:** Formal verification of build artifacts against the Release Checklist.
*   **Founder Review:** Mandatory walkthrough of new features and logic changes.
*   **Internal Release:** Alpha/Beta testing for authorized users.
*   **Production Release:** Staged rollout to all users.

---

## 2. HOTFIX & ROLLBACK
*   **Hotfix:** Only critical bugs affecting production stability are eligible for hotfixes.
*   **Rollback:** Every release must have a verified rollback procedure to version n-1.

---

## 3. RELEASE AUTHORITY
The **Founder** holds the final authority for all releases. No build shall be uploaded to the Play Store without explicit Founder Approval.
