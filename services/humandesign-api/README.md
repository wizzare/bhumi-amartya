# Human Design Microservice

This is a FastAPI microservice that calculates Human Design data.

## Setup Instructions

1. **Install Python and create a virtual environment:**
   ```bash
   cd services/humandesign-api
   python -m venv .venv
   .venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the FastAPI service:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

4. **Start the Next.js app:**
   ```bash
   npm run dev
   ```

5. **Build the Next.js app:**
   ```bash
   npm run build
   ```

### API Endpoints

- **POST /calculate**
  - **Input:**
    ```json
    {
      "name": "John Doe",
      "year": 1990,
      "month": 1,
      "day": 1,
      "hour": 12,
      "minute": 0,
      "utc_offset": 7
    }
    ```
  - **Output:**
    ```json
    {
      "type": "Projector",
      "profile": "6.2",
      "authority": "Emotional",
      "strategy": "Wait to be invited before speaking or acting",
      "notSelfTheme": "The theme of the not-self is 'Trying to be something you are not'",
      "signature": "Your signature is to follow your strategy and authority",
      "definedCenters": ["G", "S", "N"],
      "openCenters": ["A", "T", "B"],
      "gatesPersonality": [1, 2, 3],
      "gatesDesign": [4, 5, 6],
      "status": "ready",
      "source": "human-design-py"
    }
    ```

### Notes
- The service uses the `human-design-py` library to calculate Human Design data.
- CORS is enabled for `localhost:3000` to allow the Next.js app to call this service.