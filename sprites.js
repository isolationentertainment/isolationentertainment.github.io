//Add a new ship to screen.
function AddShip()
{
    ship = gfx.CreateSprite( "Img/pure_1440x1800x4x5", "ships" )
    gfx.AddSprite( ship, 0.27, 0.65 )
}

//Add rock image to screen, with physics and animation.
function AddRock()
{
	//Add a new rock image to screen at random x location.
	virus = gfx.CreateSprite( "Img/corona_256x512x1x2", "rocks" )
	var size = 0.1+0.1*Math.random()
    
	//virus.x = virus.y = 0
	virus.x = Math.random() * (0.85 - 0.02) + 0.02;
	virus.active = true
	viruses.push(virus)
	
	gfx.AddSprite( virus, null, -0.1, size )
	
	virus.Play( 0, 0.01 )
	if(!bossFight) setTimeout(AddRock, virusFreq-(difficulty*50))
}

function AddRollButton()
{
    var size = 0.14
    rollButton = gfx.CreateSprite("Img/paperIcon.png")
    rollButton.alpha = 0.5
    gfx.AddSprite( rollButton, 0.82, 0.85, size )
    rollButton.active = true
}

//Add rock image to screen, with physics and animation.
function AddBoss()
{
    var size = 0.3 * bossNo
    boss = gfx.CreateSprite("Img/boss_2688x2700x7x6", "boss" )
    gfx.AddSprite( boss, 0.28, -0.3, size )
    boss.PlayRange( 0,1, 0.01 )
}

//Add rock image to screen, with physics and animation.
function AddPaper()
{
	if(paper.active) return
	//Add a new rock image to screen at random x location.
	paper = gfx.CreateSprite("Img/paper_1024x1024x4x2", "g_papers" )
	var size = 0.2
    
	//virus.x = virus.y = 0
	paper.x = Math.random() * (0.85 - 0.02) + 0.02;
	paper.active = true
	//papers.push(paper)
	
	gfx.AddSprite( paper, null, -0.3, size )
	
	paper.PlayRange( 0,6, 0.5 )
	if(!bossFight) setTimeout(AddPaper, paperFreq + (difficulty*1000) + Math.random()*paperFreq)
}

//Add rock image to screen, with physics and animation.
function AddPasta()
{
	if(pasta.active) return
	//Add a new rock image to screen at random x location.
	pasta = gfx.CreateSprite("Img/pasta_560x560x2x2", "pastas" )
	var size = 0.2
    
	//virus.x = virus.y = 0
	pasta.x = Math.random() * (0.85 - 0.02) + 0.02;
	pasta.active = true
	
	gfx.AddSprite( pasta, null, -0.3, size )
	
	pasta.PlayRange( 0,4, 0.4 )
	if(!bossFight) setTimeout(AddPasta, pastaFreq + (difficulty*1000) + Math.random()*pastaFreq)
}

//Add rock image to screen, with physics and animation.
function AddMask()
{
	if(mask.active) return
	//Add a new rock image to screen at random x location.
	mask = gfx.CreateSprite("Img/mask_492x536x3x4", "masks" )
	var size = 0.2
    
	//virus.x = virus.y = 0
	mask.x = Math.random() * (0.85 - 0.02) + 0.02;
	mask.active = true
	
	gfx.AddSprite( mask, null, -0.3, size )
	
	mask.PlayRange( 0,8, 0.4 )
	if(!bossFight) setTimeout(AddMask, maskFreq + (difficulty*1000) + Math.random()*pastaFreq)
}


//Fire a missile from ship
function FireDrop()
{
	drop = gfx.CreateSprite( "Img/drop_384x512x3x4", "drops" )
	
	//Show missile.
	drop.x = ship.x + ship.width/2.75 - drop.width/2
	drop.active = true
	drops.push(drop)
	gfx.AddSprite( drop, null, 0.68, 0.1)
	//Start missile animation and set its speed.
	drop.Play( 0, 0.2 )
	
	//Play firing sound.
	//soundFire.Play()
	setTimeout(ResetFired, 100)
}

function FireRoll()
{
    roll = gfx.CreateSprite( "Img/paper_1024x1024x4x2" )
    
    //Show missile.
	roll.x = ship.x + ship.width/2.75 - roll.width/2
	roll.active = true
	rolls.push(roll)
	roll.angle = 0.5;
	gfx.AddSprite( roll, null, 0.68, 0.2)
	//Start missile animation and set its speed.
	roll.PlayRange( 0,6, 0.5 )
    UpdatePaperScore(-1);
}
