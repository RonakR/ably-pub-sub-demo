import Ably from 'ably'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'

let client = new Ably.Realtime.Promise(process.env.ABLY_KEY)
let app = express()
app.use(cors()) 
let port = 3000

const establishConnection = async () => {
  await client.connection.once('connected')
  console.log('connected')
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const constructors = [
  "Red Bull",
  "Ferrari",  
  "Mercedes",
  "Alpine/Renault",
  "McLaren-Mercedes",
  "Alfa Romeo-Ferrari",
  "Haas-Ferrari",
  "AlphaTauri/Red Bull",
  "Aston Martin/Mercedes",
  "Williams-Mercedes"
]

const standingsChannel = client.channels.get('standings')
const pitStopsChannel = client.channels.get('pitStops')
const penaltyChannel = client.channels.get('penalties')

const shuffleStandings = () => {
  return constructors
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

// Send random standings every 1 second
// Channel: standings
// Message: standings
const publishStandings = async () => {
  // while (true) works as a rudimentary queue in this example
  // constantly firing events at a set interval
  while (true) {
    await standingsChannel.publish("standings", JSON.stringify(shuffleStandings()))
    console.log("Standings sent")
    await sleep(1000)
  }
}

// Send one constructor every 5 seconds
// Channel: pitStops
// Message: pitStops
const publishPitStops = async () => {
  while (true) {
    const randomConstructor = constructors[Math.floor(Math.random() * constructors.length)];
    await pitStopsChannel.publish("pitStops", randomConstructor)
    console.log("pit stops sent", randomConstructor)
    await sleep(5000)
  }
}

// Send 50 penalties immediately to fill up Channel History
// Then send one penalty every one second
// Channel: penalties
// Message: penalties
const publishPenalities = async () => {
  let i = 0
  while (i < 50) {
    const randomConstructor = constructors[Math.floor(Math.random() * constructors.length)];
    const penaltyTypes = ["Drive-through", "Stop-go", "Grid-position"]
    const randomPenalty = penaltyTypes[Math.floor(Math.random() * penaltyTypes.length)];
    penaltyChannel.publish("penalties", `${randomConstructor} has been penalized: ${randomPenalty} Penalty`)
    console.log("penalties sent")
    i++
  }
  
  while (true) {
    const randomConstructor = constructors[Math.floor(Math.random() * constructors.length)];
    const penaltyTypes = ["Drive-through", "Stop-go", "Grid-position"]
    const randomPenalty = penaltyTypes[Math.floor(Math.random() * penaltyTypes.length)];
    await penaltyChannel.publish("penalties", `${randomConstructor} has been penalized: ${randomPenalty} Penalty`)
    console.log("penalties sent")
    await sleep(5000)
  }
}

// Handle token generation for client side
app.get('/requestToken/:clientId', async (req, res) => {
  try {
    await client.auth.createTokenRequest({clientId: req.params.clientId})
    const token = await client.auth.requestToken({clientId: req.params.clientId})
    res.status(200).send(token)
  } catch (e) {
    console.error(e)
  }
})

await establishConnection()
publishStandings()
publishPitStops()
publishPenalities()

app.listen(port, () => console.log("Server started"))


const close = () => {
  client.close(); // runs synchronously
  console.log('Closed the connection to Ably.');
}
process.on('exit', close)
