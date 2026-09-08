# SMARTMINE — AI & Free API Recommendation

## SIH26024: AI-Based Smart Governance and Compliance Monitoring System for Coal Mines

### 1. Objective

SMARTMINE should use AI only where it adds measurable intelligence. Core governance workflows such as RBAC, approvals, compliance assignments, audit logs, escalation rules and CRUD operations should remain deterministic.

Recommended principle:

**Capture → Validate → Monitor → Analyze → Predict → Alert → Act → Verify → Audit**

---

## 2. AI capabilities and recommended technology

| Capability | SMARTMINE use | Recommended technology |
|---|---|---|
| AI Governance Assistant | Natural-language questions over mine/compliance data | Gemini API |
| AI Risk Intelligence | Mine risk score + explanation | Python/scikit-learn; Gemini for explanation |
| Recurring Violation Detection | Repeated failures and patterns | SQL + Python |
| Compliance Document Intelligence | OCR + extraction + classification | PaddleOCR + Gemini |
| Smoke/PPE Detection | CCTV/image safety detection | YOLO |
| Operational Anomaly Detection | Production/environment/attendance anomalies | Python ML/statistics |

---

## 3. Primary hosted API — Google Gemini

Gemini should be the primary hosted API for the generative-AI layer:

- Governance Assistant
- Compliance explanations
- Recommendations
- Summarization
- Natural-language dashboard queries
- Structured document understanding
- Risk explanations

Google currently lists a free tier with free input/output tokens for eligible models. Exact limits are model-dependent and can change.

Official pricing:

https://ai.google.dev/gemini-api/docs/pricing

### Recommended architecture

```text
React / React Native
        ↓
Node.js backend
        ↓
Gemini API
```

**Never expose the Gemini API key in React or React Native.**

---

## 4. AI Governance Assistant

Example:

> "What are the highest-risk issues in Rajmahal mine?"

The backend should first retrieve relevant database information:

- Open high-severity violations
- Overdue compliance assignments
- Unresolved safety observations
- Recent incidents
- Environmental threshold breaches
- Corrective-action delays

Only the relevant results should be sent to Gemini.

The LLM then generates a grounded management response.

### Important

Do **not** build a generic chatbot.

Build a **database-grounded Governance Assistant** that answers questions using actual SMARTMINE data.

---

## 5. Mine Risk Intelligence

Do not ask an LLM to calculate the numerical risk score.

Use deterministic scoring or a Python ML model.

Example weighting:

```text
Compliance Risk        25%
Safety Violations      25%
Incident History       20%
Corrective Delays      15%
Environmental Risk     10%
Operational Anomalies   5%
```

Example output:

```text
LOW       0–30
MEDIUM   31–60
HIGH     61–80
CRITICAL 81–100
```

Gemini can then explain:

- Why the mine has this risk level
- Which factors contributed most
- What actions should be prioritized

---

## 6. Recurring Violation Detection

Use SQL and Python to identify repeated patterns.

Example:

```text
Dust suppression violation

Jan → Feb → Apr → Jun → Sep

        ↓

Recurring compliance pattern detected
```

The system can identify:

- Repeated issue
- Frequency
- Affected mine
- Severity
- Historical corrective actions

Gemini can convert the detected pattern into a concise management recommendation.

---

## 7. Compliance Document Intelligence

Recommended pipeline:

```text
PDF / Image
     ↓
OCR
     ↓
Extracted Text
     ↓
Structured Fields
     ↓
Validation
     ↓
Compliance Result
     ↓
Evidence Storage
```

### OCR

Prefer free/local tools:

- **PaddleOCR**
- **Tesseract OCR**

This avoids recurring API costs and provides more control over sensitive documents.

Use Gemini for higher-level extraction, classification or explanation when necessary.

---

## 8. Computer Vision

The SMARTMINE repository already contains a YOLO-based smoke-detection module.

Potential computer-vision use cases:

- Smoke detection
- Fire detection
- PPE detection
- Person/unsafe-zone detection
- Camera-based safety events

Pipeline:

```text
CCTV / Image
     ↓
YOLO
     ↓
Detection
     ↓
Confidence Threshold
     ↓
Safety Event
     ↓
Alert
     ↓
Incident Workflow
```

Prefer local inference where possible instead of paying for a hosted vision API.

---

## 9. Operational Anomaly Detection

### Production

Use:

- Target tonnes
- Actual tonnes
- Equipment downtime
- Historical output

Example:

```text
Target: 2500 tonnes
Actual: 1800 tonnes

        ↓

Production anomaly detected
```

### Environment

Monitor:

- PM10
- PM2.5
- Noise
- Methane
- CO2
- Temperature
- Water quality

### Attendance

Monitor:

- Repeated late arrivals
- Unusual attendance patterns
- Abnormal shift activity

Use Python/scikit-learn/statistical methods first.

An LLM is not required for numerical anomaly detection.

---

## 10. Free / low-cost AI options

| Tool / API | Best use | Recommendation |
|---|---|---|
| **Gemini API** | LLM + multimodal intelligence | **Primary hosted API** |
| **Groq** | Very fast LLM inference | Secondary option; verify current limits |
| **OpenRouter** | Testing multiple models | Useful for experimentation |
| **Hugging Face** | Model experimentation / embeddings / classifiers | Secondary/testing |
| **PaddleOCR** | OCR | **Primary local OCR** |
| **Tesseract** | OCR fallback | Secondary local OCR |
| **YOLO** | Computer vision | **Primary CV** |
| **scikit-learn** | Risk/anomaly ML | **Primary local ML** |

Provider free tiers and limits can change, so verify current limits before final deployment.

---

## 11. Recommended final AI stack

### Generative AI

**Gemini API**

### OCR

**PaddleOCR**

### Computer Vision

**YOLO**

### Machine Learning

**Python + scikit-learn**

### Data Processing

**Python + SQL**

### Backend

**Node.js / TypeScript**

### AI Service

**Python + FastAPI**

### Architecture

```text
                    SMARTMINE
                        │
                 React / React Native
                        │
                        ↓
                  Node.js API
                        │
          ┌─────────────┼─────────────┐
          │             │             │
        MySQL         Python AI     Redis/Queue
                        │
          ┌─────────────┼─────────────┐
          │             │             │
       Gemini          YOLO       ML / OCR
          │             │             │
          └─────────────┴─────────────┘
```

---

## 12. What should NOT use an LLM

Do not use Gemini for:

- RBAC authorization
- Permission checking
- Page visibility
- Compliance deadlines
- SLA calculations
- Audit log creation
- Numerical production calculations
- Attendance calculations
- Database CRUD
- Workflow state transitions
- Emergency severity rules

These should remain deterministic and auditable.

---

## 13. SIH prototype priority

If development time is limited, implement in this order:

### Priority 1 — AI Mine Risk Intelligence

Show a mine changing from Medium → High risk based on live/sample events.

### Priority 2 — AI Governance Assistant

Ask questions about actual SMARTMINE database data and receive grounded answers.

### Priority 3 — AI Smoke/PPE Detection

Use the existing YOLO pipeline to generate a safety event.

### Priority 4 — Compliance OCR

Upload a compliance document and extract important fields.

### Priority 5 — Anomaly Detection

Demonstrate production/environment/attendance anomalies.

---

## 14. Security rules

API keys must never be stored in:

- React source code
- React Native source code
- GitHub
- Browser-exposed environment variables

Use:

```text
Node.js / Python backend
        ↓
Environment Variable / Secret Manager
        ↓
AI Provider
```

Also avoid sending unnecessary personally identifiable or sensitive worker information to external LLMs.

---

## 15. Final recommendation

For the SIH prototype, use:

**Gemini API + YOLO + PaddleOCR + Python/scikit-learn**

This gives SMARTMINE four distinct intelligence layers:

1. **Reasoning** — Gemini
2. **Vision** — YOLO
3. **Document Understanding** — OCR + Gemini
4. **Prediction / Anomaly Detection** — Python ML

The product should remain a governance and compliance platform. AI should provide intelligence on top of reliable workflows and auditable data.

### Presentation line

> **SMARTMINE combines deterministic governance workflows with generative AI, computer vision, document intelligence and predictive analytics to move mine governance from reactive compliance to proactive risk intelligence.**
