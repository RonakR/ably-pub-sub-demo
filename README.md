# Ably Interview

Once again I want to thank you all for taking the time to interview me, and providing valuable feedback.

While I could not better the presentation or the technical approach, I did spend some time updating my demo. 

It now:
- is Motorsport Team focused in it's data and use case
- uses the proper Auth Token method for the client side
- has a backend that functions closer to the scenario of events being sent to Ably

## Setup

Navigate to `ably-pub` and create a `.env` file based on `.env.example`

Navigate back to the top level and run:
- `docker compose build`
- `docker compose up`
- visit `http://localhost:5173`

If there any issues with the docker setup, you can individually run the application.

- In one shell, navigate to `ably-pub`
- run: `npm run publish`

- In another shell, navigate to `ably-frontend`
- run: `npm run dev`

- visit `http://localhost:5173`