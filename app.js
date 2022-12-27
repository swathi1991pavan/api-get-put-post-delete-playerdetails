const express = require("express");
const app = express();

const { open } = require("sqlite");
const path = require("path");
const sqLite3 = require("sqlite3");
let db = null;
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqLite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log(`db error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerDetails = `select * from cricket_team order by player_id`;
  const playerArray = await db.all(getPlayerDetails);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//post method

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const addPlayerQuery = `insert into cricket_team ( player_name, jersey_number, role) 
  values ('${playerName}','${jerseyNumber}','${role}');`;

  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});
/*app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
  INSERT INTO
    cricket_team (player_name, jersey_number, role)
  VALUES
    ('${playerName}', ${jerseyNumber}, '${role}');`;
  const player = await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});*/

//get for particular id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `select * from cricket_team where player_id=${playerId}`;
  const playerArray = await db.get(getPlayerDetails);
  response.send(convertDbObjectToResponseObject(playerArray));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//put
/*app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;

  const updatePlayerDetails = `update cricket_team set
                    player_id=${playerId},
                    player_name=${playerName},
                    jersey_number=${jerseyNumber},
                    role=${role}
                    where
                    player_id =${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});*/
//delete
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerDetails = `delete from cricket_team 
                    where
                    player_id =${playerId};`;
  await db.run(deletePlayerDetails);
  response.send("Player Removed");
});

module.exports = app;
