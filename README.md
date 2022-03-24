# DemonlistBot
Utility bot to get information from the [Geometry Dash Demonlist](https://pointercrate.com/)

## APIs used
- [Pointercrate](https://pointercrate.com/documentation/index)
- [GDBrowser](https://gdbrowser.com/api)

### Example Responses
**Pointercrate (levels)** `https://pointercrate.com/api/v2/demons/listed?after=<number>&limit=<number>`
```json
[
    {
		"id": 379,
		"position": 3,
		"name": "Firework",
		"requirement": 49,
		"video": "https://www.youtube.com/watch?v=QBe5x2o9v2w",
		"publisher": {"id": 36915,"name": "Trick","banned": false},
		"verifier": {"id": 36915,"name": "Trick","banned": false},
		"level_id": 75206202
	}
]
```

**Pointercrate (players)** `https://pointercrate.com/api/v1/players/ranking?after=<number>&limit=<number>`
```json
[
	{
		"id": 35819,
		"name": "spaceuk",
		"rank": 1,
		"score": 5698.915605877103,
		"nationality": {"country_code": "GB","nation": "United Kingdom","subdivision": null}
	}
]
```

```
{
	"data":{
		"banned": false,
		"created": [],
		"id": 1,
		"name": "1amP1ay3R",
		"nationality": null,
		"published": [],
		"records": [], 
		"verified": []
	}
}
```

**Pointercrate (records of a level)**
```json
[
	{
		"id": 12672,
		"nationality": {"country_code": "US", "nation": "United States", "subdivision":null},
		"player": {"banned": false, "id": 575, "name": "Skulzi"},
		"progress": 100,
		"status": "approved",
		"video": "https://www.youtube.com/watch?v=oo9ZYGJZCwk"
	}
]
```

**GDBrowser (level)** `https://gdbrowser.com/api/level/<id>`
```json
{
	"name": "Nine Circles",
	"id": "4284013",
	"description": "Easy",
	"author": "Zobros",
	"playerID": "957447",
	"accountID": "2379",
	"difficulty": "Hard Player",
	"downloads": 30523740,
	"likes": 1898461,
	"disliked": false,
	"length": "Long",
	"stars": 10,
	"orbs": 500,
	"diamonds": 12,
	"featured": true,
	"epic": false,
	"gameVersion": "2.0",
	"editorTime": 0,
	"totalEditorTime": 0,
	"version": 5,
	"copiedID": "0",
	"twoPlayer": false,
	"officialSong": 0,
	"customSong": 533927,
	"coins": 3,
	"verifiedCoins": true,
	"starsRequested": 0,
	"ldm": false,
	"objects": 0,
	"large": false,
	"cp": 2,
	"difficultyFace": "demon-hard-featured",
	"songName": "NK - Nine Circles",
	"songAuthor": "Rukkus",
	"songSize": "7.76MB",
	"songID": 533927,
	"songLink": "http://audio.ngfiles.com/533000/533927_NK---Nine-Circles.mp3"
}
```